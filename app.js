let ruesData = rues;

const loadTournee = () => {
    const stored = localStorage.getItem('tournee');
    if (stored) {
        return JSON.parse(stored);
    }

    tourneeData.forEach(village => {
        village.rues.forEach(rue => {
            rue.adresses.forEach(addr => {
                if (addr.fait === undefined) {
                addr.fait = false;
                }
            });
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

const updateAddress = (nom_village, rue, numero, type) => {
    const village = tournee.find(v => v.nom_village === nom_village);
    if (!village) {
        console.warn(`Village non trouvé : ${nom_village}`);
        return;
    }

    let updated = false;
    for (const rueData of village.rues) {
        if (rueData.nom_rue === rue) {
        const addr = rueData.adresses.find(a => a.numero === numero);
        if (addr) {
            if (type === 'colis') addr.colis++;
            if (type === 'reco') addr.reco_suivi++;
            if (type === 'courrier') addr.courier = true;
            if (type === 'pub') addr.pub = true;
            updated = true;
            break;
        }
        }
    }

    if (!updated) {
        console.warn(`Adresse non trouvée : ${nom_village}, ${rue}, ${numero}`);
    }

    saveData();
};


const showPage = (page) => {
  ["home", "colis", "reco", "courrier", "tournee"].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', id !== page);
  });
  if (page === 'colis') makeList('colis', 'colisList');
  if (page === 'reco') makeList('reco', 'recoList');
  if (page === 'courrier') makeList('courrier', 'courrierList');
};

const goHome = () => {
  ["home", "colis", "reco", "courrier", "tournee"].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('home').classList.remove('hidden');
};

const makeList = (type, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    Object.entries(rues).forEach(([nom_village, village]) => {
        const villageDiv = document.createElement("div");
        villageDiv.className = 'village';

        const villageTitle = document.createElement('h3');
        villageTitle.textContent = nom_village;
        villageTitle.style.cursor = 'pointer';
        villageTitle.onclick = () => {
            containerRues.classList.toggle('hidden');
        };

        villageDiv.appendChild(villageTitle);

        const containerRues = document.createElement("div");
        containerRues.className = 'rues-container';
        villageDiv.appendChild(containerRues);

        Object.entries(village).forEach(([rue, numeros]) => {
            const rueDiv = document.createElement('div');
            rueDiv.className = 'street';

            const rueTitle = document.createElement('div');
            rueTitle.className = 'street-name';
            rueTitle.textContent = rue;
            rueDiv.appendChild(rueTitle);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'number-buttons';

            numeros.forEach(num => {
                const btn = document.createElement('button');
                btn.textContent = num;

                // attributs pour le selectAll
                btn.setAttribute('data-village', nom_village);
                btn.setAttribute('data-rue', rue);
                btn.setAttribute('data-numero', num);
                btn.setAttribute('data-type', type);

                btn.onclick = () => {
                    updateAddress(nom_village, rue, num, type);
                    btn.classList.add('selected');
                };

                const village = tournee.find(v => v.nom_village === nom_village);
                if (village) {
                    for (const rueData of village.rues) {
                        if (rueData.nom_rue === rue) {
                            const addr = rueData.adresses.find(a => a.numero === num);
                            if (addr) {
                                if (
                                    (type === 'colis' && addr.colis > 0) ||
                                    (type === 'reco' && addr.reco_suivi > 0) ||
                                    (type === 'courrier' && addr.courier === true)
                                ) {
                                    btn.classList.add('selected');
                                }
                            }
                        }
                    }
                }

                buttonsDiv.appendChild(btn);
            });

            rueDiv.appendChild(buttonsDiv);
            containerRues.appendChild(rueDiv);
        });

        container.appendChild(villageDiv);
    });
}

const selectAll = (type) => {
    Object.entries(rues).forEach(([nom_village, villageRues]) => {
        Object.entries(villageRues).forEach(([nom_rue, numeros]) => {
        numeros.forEach(numero => {
            updateAddress(nom_village, nom_rue, numero, type);

            const btnSelector = `button[data-village="${nom_village}"][data-rue="${nom_rue}"][data-numero="${numero}"][data-type="${type}"]`;
            const btn = document.querySelector(btnSelector);
            if (btn) {
            btn.classList.add('selected');
            }
        });
        });
    });
};

const launchTournee = () => {
    const tourneeList = document.getElementById('tourneeList');
    tourneeList.innerHTML = '';

    let currentVillageName = null;

    tournee.forEach(village => {
        // Si nouveau village, afficher un titre
        if (village.nom_village !== currentVillageName) {
            currentVillageName = village.nom_village;
            const villageTitle = document.createElement('h3');
            villageTitle.textContent = currentVillageName;
            tourneeList.appendChild(villageTitle);
        }

        village.rues.forEach(rue => {
            rue.adresses.forEach(addr => {
                if (addr.colis || addr.reco_suivi || addr.courier) {
                    let icons = '';
                    if (addr.colis) icons += '📦'.repeat(addr.colis);
                    if (addr.reco_suivi) icons += '📬'.repeat(addr.reco_suivi);
                    if (addr.courier) icons += '✉️';

                    const label = `<strong>${addr.numero}</strong> ${rue.nom_rue} ${icons}`;

                    addTask(tourneeList, label, village.nom_village, rue.nom_rue, addr.numero, addr.fait);
                }
            });
        });
    });

    showPage('tournee');
};


const addTask = (container, label, nomVillage, nomRue, numeroText, isDone) => {
    const div = document.createElement('div');
    div.className = 'task';

    const content = document.createElement('div');
    content.className = 'task-content';

    const [numPart, ...rest] = label.split(' ');
    const numero = numPart.replace(/<[^>]*>/g, ''); 
    const rueEtIcones = label.replace(numPart, '').trim();

    const numeroDiv = document.createElement('div');
    numeroDiv.className = 'numero';
    numeroDiv.innerHTML = `<strong>${numero}</strong>`;

    const rueDiv = document.createElement('div');
    rueDiv.className = 'rue';
    rueDiv.innerHTML = rueEtIcones;

    content.appendChild(numeroDiv);
    content.appendChild(rueDiv);

    const button = document.createElement('button');
    button.className = 'done-button';
    button.textContent = isDone ? 'Fait' : 'À faire';
    button.classList.add(isDone ? 'is-done' : 'to-do');
    if (isDone) {
        div.classList.add('done');
    }

    button.onclick = () => {
        div.classList.add('done');
        button.classList.remove('to-do');
        button.classList.add('is-done');
        button.textContent = 'Fait';


        const village = tournee.find(v => v.nom_village === nomVillage);
        if (village) {
            const rueObj = village.rues.find(r => r.nom_rue === nomRue);
            if (rueObj) {
                const addr = rueObj.adresses.find(a => a.numero === numeroText);
                if (addr) {
                    addr.fait = true;
                }
            }
        }

        saveData();

        const next = document.querySelector('.done-button.to-do');
        if (next) {
            const offset = 110;
            const y = next.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });

            const taskDiv = next.closest('.task');
            taskDiv.classList.add('highlight');
            setTimeout(() => taskDiv.classList.remove('highlight'), 1000);
        }
    };

    div.appendChild(content);
    div.appendChild(button);
    container.appendChild(div);
};

const makeAddressKey = (village, rue, numero) => `${village}|${rue}|${numero}`;
