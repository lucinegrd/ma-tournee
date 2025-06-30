import json

def parse_input(data):
    villages = []
    lignes = data.strip().split('\n')

    village_courant = None
    rues_courantes = []

    for ligne in lignes:
        ligne = ligne.strip()
        if not ligne:
            continue

        # Si ligne est un nom de village (finit par :) et ne contient pas de virgule
        if ligne.endswith(':') and ',' not in ligne:
            # Sauvegarde le précédent village
            if village_courant:
                villages.append({
                    "nom_village": village_courant,
                    "rues": rues_courantes
                })
            village_courant = ligne[:-1].strip()
            rues_courantes = []
        elif ';' in ligne:
            nom_rue = ligne[:-1]

            rues_courantes.append({
                "nom_rue": nom_rue,
                "colis": [],
                "depot": False,
                "bal": False
            })

    # Ajouter le dernier village
    if village_courant:
        villages.append({
            "nom_village": village_courant,
            "rues": rues_courantes
        })

    return villages

def main():
    # Lire le fichier d'entrée
    with open('rues.txt', 'r', encoding='utf-8') as f:
        contenu = f.read()

    # Transformer les données
    resultat = parse_input(contenu)

    # Écrire le fichier JS
    with open("rues_tournee.js", "w", encoding="utf-8") as f:
        f.write("const tourneeData = ")
        json.dump(resultat, f, indent=2, ensure_ascii=False)
        f.write(";\n")

if __name__ == "__main__":
    main()
