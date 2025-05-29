import re
import json
from collections import defaultdict

# === Lecture du fichier ===
with open("rues.txt", "r", encoding="utf-8") as f:
    data = f.read()

# === Traitement ===
result = defaultdict(lambda: defaultdict(set))

for line in data.strip().splitlines():
    if ':' not in line:
        continue
    if line.endswith(':'):
        current_city = line.replace(":", "").strip()
        continue

    rue, nums = line.split(":", 1)
    rue = rue.strip()
    num_list = [n.strip() for n in nums.strip().split(",") if n.strip()]

    for num in num_list:
        result[current_city][rue].add(num)

def custom_sort_key(n):
    match = re.match(r"(\d+)([A-Za-z]*)", n)
    if match:
        base = int(match.group(1))
        suffix = match.group(2)
        return (base, suffix)
    return (float('inf'), n)

final_result = {}
for city, rues in result.items():
    final_result[city] = {}
    for rue, numeros in rues.items():
        sorted_list = sorted(numeros, key=custom_sort_key)
        final_result[city][rue] = sorted_list

# === Écriture dans un fichier JS ===
with open("rues_triee.js", "w", encoding="utf-8") as f:
    f.write("const rues = ")
    json.dump(final_result, f, indent=2, ensure_ascii=False)
    f.write(";\n")
