const loadTournee = () => {
    const stored = localStorage.getItem('tournee');
    if (stored) {
        return JSON.parse(stored);
    }

    // Initialisation des propriétés si absentes
    tourneeData.forEach(village => {
        village.rues.forEach(rue => {
            if (!Array.isArray(rue.colis)) rue.colis = [];
            if (rue.depot === undefined) rue.depot = false;
            if (rue.bal === undefined) rue.bal = false;
        });
    });

    return tourneeData;
};

let tournee = loadTournee();



const saveData = () => {
    localStorage.setItem('tournee', JSON.stringify(tournee));
};

const resetAvancement = () => {
    localStorage.removeItem('tournee');
    window.location.reload();
};


const updateAddress = (nom_village, nom_rue, numero, type) => {
    // 1) Cherche le village
    const village = tournee.find(v => v.nom_village === nom_village);
    if (!village) {
        console.warn(`Village non trouvé : ${nom_village}`);
        return;
    }

    // 2) Cherche la (bonne) rue
    const rueData = village.rues.find(r => r.nom_rue === nom_rue);
    if (!rueData) {
        console.warn(`Rue introuvable : ${nom_rue} dans ${nom_village}`);
        return;
    }

    // 3) Applique la modification selon le type
    switch (type) {
        case 1: {              // ➜ ajouter un numéro dans le tableau « colis »
            if (numero === null || numero === undefined || numero === '') {
                console.warn('Numéro manquant pour type 1');
                break;
            }
            const num = parseInt(numero, 10);
            if (!Number.isNaN(num) && !rueData.colis.includes(num)) {
                rueData.colis.push(num.toString());
                // petit tri pour garder les numéros dans l’ordre croissant
                rueData.colis.sort((a, b) => a - b);
            }
            break;
        }
        case 2:                // ➜ dépôt
            rueData.depot = true;
            break;
        case 3:                // ➜ BAL
            rueData.bal = true;
            break;
        default:
            console.warn(`Type inconnu : ${type}`);
            return;
  }

  // 4) Sauvegarde dans le localStorage
  saveData();
};




const showPage = (page) => {
  ["home", "colis", "depot", "bal", "tournee"].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', id !== page);
  });
  if (page === 'colis') makeList('colis', 'colisList');
  if (page === 'depot') makeList('depot', 'depotList');
  if (page === 'bal') makeList('bal', 'balList');
};

const goHome = () => {
  ["home", "colis", "depot", "bal", "tournee"].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('home').classList.remove('hidden');
};


const makeList = (type, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    tournee.forEach(village => {
        const villageDiv = document.createElement('div');
        villageDiv.className = 'village';

        const villageTitle = document.createElement('h3');
        villageTitle.textContent = village.nom_village;

        const ruesContainer = document.createElement('div');
        ruesContainer.className = 'rues-container';
        villageTitle.onclick = () => ruesContainer.classList.toggle('hidden');

        villageDiv.appendChild(villageTitle);
        villageDiv.appendChild(ruesContainer);

        village.rues.forEach(rue => {
            const btn = document.createElement('button');
            btn.className = 'rue-btn';
            btn.textContent = rue.nom_rue;

            btn.dataset.village = village.nom_village;
            btn.dataset.rue = rue.nom_rue;

            // Colis : afficher nombre et ouvrir clavier
            if (type === 'colis') {
                const nbColis = Array.isArray(rue.colis) ? rue.colis.length : 0;
                if (nbColis > 0) {
                    btn.classList.add('selected');
                    btn.textContent += ` (${nbColis})`;
                }
                btn.onclick = () => {
                    ouvrirClavier(village.nom_village, rue.nom_rue);
                };
            }

            // Dépôt ou BAL : toggle true/false
            else if (type === 'depot' || type === 'bal') {
                const flag = (type === 'depot') ? rue.depot : rue.bal;
                if (flag) btn.classList.add('selected');

                btn.onclick = () => {
                    // Trouve la rue dans `tournee` et toggle
                    let rueData = tournee
                        .find(v => v.nom_village === village.nom_village)
                        .rues.find(r => r.nom_rue === rue.nom_rue);

                    if (type === 'depot') {
                        rueData.depot = !rueData.depot;
                        btn.classList.toggle('selected', rueData.depot);
                    } else {
                        rueData.bal = !rueData.bal;
                        btn.classList.toggle('selected', rueData.bal);
                    }

                    saveData();
                };
            }

            ruesContainer.appendChild(btn);
        });

        container.appendChild(villageDiv);
    });
};




const launchTournee = () => {
  const tourneeList = document.getElementById('tourneeList');
  tourneeList.innerHTML = '';

  tournee.forEach(village => {
    /* ----- Titre du village ----- */
    const h3 = document.createElement('h3');
    h3.textContent = village.nom_village;
    tourneeList.appendChild(h3);

    /* ----- Rues ----- */
   village.rues.forEach(rue => {
  // Si rien à afficher, on saute
  const hasColis = rue.colis && rue.colis.length > 0;
  const hasDepot = rue.depot === true;
  const hasBal = rue.bal === true;

  if (!hasColis && !hasDepot && !hasBal) return;

  // Ligne titre rue + icônes
  const rueHeader = document.createElement('div');
  rueHeader.className = 'rue-header';
  rueHeader.innerHTML = `<strong>${rue.nom_rue}</strong>`;
  tourneeList.appendChild(rueHeader);

  const numsDiv = document.createElement('div');
  numsDiv.className = 'nums-row';

  if (hasDepot) {
    const btnDepot = document.createElement('button');
    btnDepot.textContent = '📥';
    btnDepot.className = 'num-btn';
    btnDepot.onclick = () => {
      btnDepot.classList.toggle('done');
    };
    numsDiv.appendChild(btnDepot);
  }

  if (hasBal) {
    const btnBal = document.createElement('button');
    btnBal.textContent = '📮';
    btnBal.className = 'num-btn';
    btnBal.onclick = () => {
      btnBal.classList.toggle('done');
    };
    numsDiv.appendChild(btnBal);
  }

  if (hasColis) {
    rue.colis.sort((a, b) => a - b).forEach(num => {
      const btn = document.createElement('button');
      btn.textContent = num;
      btn.className = 'num-btn';

      rue.done = rue.done || [];
      if (rue.done.includes(num)) btn.classList.add('done');

      btn.onclick = () => {
        if (!rue.done.includes(num)) {
          rue.done.push(num);
          btn.classList.add('done');
        } else {
          rue.done = rue.done.filter(n => n !== num);
          btn.classList.remove('done');
        }
        saveData();
      };

      numsDiv.appendChild(btn);
    });
  }

  tourneeList.appendChild(numsDiv);
});

  });

  showPage('tournee');
};

const ouvrirClavier = (nomVillage, nomRue) => {
    // Crée ou affiche une popup
    let popup = document.getElementById('clavierPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'clavierPopup';
        popup.className = 'popup';

        popup.innerHTML = `
            <div class="popup-content">
                <h3 id="popupTitle">Ajouter un numéro</h3>
                <input type="number" id="numeroInput" placeholder="Numéro de rue" />
                <div class="popup-buttons">
                    <button id="validerNumero">Valider</button>
                    <button id="fermerPopup">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Ajoute les actions
        document.getElementById('fermerPopup').onclick = () => {
            popup.classList.add('hidden');
        };

        document.getElementById('validerNumero').onclick = () => {
            const num = document.getElementById('numeroInput').value.trim();
            if (num !== '') {
                updateAddress(nomVillage, nomRue, num, 1);  // type 1 = colis
                popup.classList.add('hidden');
                document.getElementById('numeroInput').value = '';
                showPage('colis');  // Recharge la page pour affichage
            }
        };
    }

    // Met à jour le titre et affiche
    document.getElementById('popupTitle').textContent = `Ajouter un numéro à ${nomRue} (${nomVillage})`;
    popup.classList.remove('hidden');
    document.getElementById('numeroInput').focus();
};


function ajouterRue() {
    const village = prompt("Nom du village :")?.trim();
    const rue = prompt("Nom de la rue à ajouter :")?.trim();

    if (!village || !rue) {
        alert("Saisie invalide.");
        return;
    }

    // Cherche le village existant
    let villageData = tournee.find(v => v.nom_village === village);

    if (!villageData) {
        // Crée le village s'il n'existe pas
        villageData = {
            nom_village: village,
            rues: []
        };
        tournee.push(villageData);
    }

    // Vérifie si la rue existe déjà
    const existe = villageData.rues.some(r => r.nom_rue === rue);
    if (existe) {
        alert("Cette rue existe déjà dans ce village.");
        return;
    }

    // Ajoute la rue vide
    villageData.rues.push({
        nom_rue: rue,
        colis: [],
        done: [],
        depot: false,
        bal: false
    });

    saveData();
    alert(`Rue ajoutée à ${village} : ${rue}`);
    showPage('colis'); // recharge la page active si tu veux mettre à jour l'affichage
}
