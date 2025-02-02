#!/usr/bin/env python3
"""
Module: SafeRouteCrimeAnalysis.py

This module provides functionality to process route segments by buffering each segment (to create a corridor)
and then querying an InterSystems IRIS database for crime records that fall within the bounding box of the
buffered segment.

The primary function exposed by this module is `AnalyzeSegments()`, which accepts a list of route segments
and returns a list of segments enriched with crime data.
"""

import os
import iris
from shapely.geometry import LineString

# Default buffer distance in degrees (approximately 15 meters)
DefaultBufferDistance = 0.00014

def GetDatabaseConnection(UserName: str, Password: str, HostName: str, Port: str, NameSpace: str):
    """
    Connect to the InterSystems IRIS database.

    Args:
        UserName (str): Database username.
        Password (str): Database password.
        HostName (str): Hostname of the IRIS server.
        Port (str): Port number.
        NameSpace (str): Namespace to use in IRIS.

    Returns:
        iris.Connection: An open connection to the IRIS database.
    """
    ConnectionString = f"{HostName}:{Port}/{NameSpace}"
    Conn = iris.connect(ConnectionString, UserName, Password)
    return Conn

def GetSegmentBbox(Segment, BufferDistance: float = DefaultBufferDistance) -> tuple:
    """
    Compute the bounding box for a route segment after buffering it.

    Args:
        Segment (tuple): A tuple of the form (((Lat1, Long1), (Lat2, Long2)), SegLength).
        BufferDistance (float): Buffer distance in degrees.

    Returns:
        tuple: Bounding box as (MinLong, MinLat, MaxLong, MaxLat).
    """
    ((Lat1, Long1), (Lat2, Long2)), _ = Segment
    # Shapely uses (longitude, latitude)
    Pt1 = (Long1, Lat1)
    Pt2 = (Long2, Lat2)
    Line = LineString([Pt1, Pt2])
    BufferPolygon = Line.buffer(BufferDistance)
    return BufferPolygon.bounds

def FetchCrimes(Cursor, TableName: str, Bbox: tuple) -> list:
    """
    Execute a SQL query to fetch crime records within a given bounding box.

    Args:
        Cursor: The database cursor.
        TableName (str): The name of the table containing crime data.
        Bbox (tuple): Bounding box (MinLong, MinLat, MaxLong, MaxLat).

    Returns:
        list: List of tuples representing the crime records.
    """
    MinLong, MinLat, MaxLong, MaxLat = Bbox
    Sql = f"""
        SELECT Longitude, Latitude, CrimeType, Context, ContextVector 
        FROM {TableName}
        WHERE Longitude BETWEEN ? AND ?
          AND Latitude BETWEEN ? AND ?
    """
    Cursor.execute(Sql, [MinLong, MaxLong, MinLat, MaxLat])
    return Cursor.fetchall()

def AnalyzeSegments(
    OriginalSegments: list, # Only parse with this
    BufferDistance: float = DefaultBufferDistance,
    DbConfig: dict = None
) -> list:
    """
    Process each route segment to determine its buffered bounding box and
    query the crime database for records within that bounding box.

    Args:
        OriginalSegments (list): List of segments, where each segment is
                                 (((Lat1, Long1), (Lat2, Long2)), SegLength).
        BufferDistance (float): The buffer distance in degrees.
        DbConfig (dict, optional): Dictionary containing database configuration.
            Expected keys: 'UserName', 'Password', 'HostName', 'Port', 'NameSpace', 'TableName'.
            Defaults to demo values if not provided.

    Returns:
        list: List of dictionaries, one per segment, containing:
              - 'Segment': The original segment tuple.
              - 'Bbox': The buffered bounding box.
              - 'SegLength': The segment length.
              - 'Crimes': The list of crime records found.
    """
    if DbConfig is None:
        DbConfig = {
            "UserName": "demo",
            "Password": "demo",
            "HostName": os.getenv("IRIS_HOSTNAME", "localhost"),
            "Port": "1972",
            "NameSpace": "USER",
            "TableName": "SafeRoute.CrimeDataSample"
        }
    
    # Connect to the database and obtain a cursor.
    Conn = GetDatabaseConnection(
        DbConfig["UserName"],
        DbConfig["Password"],
        DbConfig["HostName"],
        DbConfig["Port"],
        DbConfig["NameSpace"]
    )
    Cursor = Conn.cursor()

    Results = []
    for Segment in OriginalSegments:
        Bbox = GetSegmentBbox(Segment, BufferDistance)
        # Unpack segment length (for reporting purposes)
        _, SegLength = Segment
        Crimes = FetchCrimes(Cursor, DbConfig["TableName"], Bbox)
        Results.append({
            "Segment": Segment,
            "SegLength": SegLength,
            "Crimes": Crimes
        })
    
    Cursor.close()
    Conn.close()
    return Results
