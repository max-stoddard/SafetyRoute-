from calculateScore import calc
def calculatePathScores(segments):

    paths = []

    for elem in segments:
        crimes = elem[0]
        length = elem[1]

        crime_numbers = []

        for c in crimes:
            crime_numbers.append(calc(c))

        paths.append((crime_numbers, length))

    return paths






