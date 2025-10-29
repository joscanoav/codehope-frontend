// --- CONSTANTES Y DATOS DE NIVELES ---

const MAX_POINTS = 150; // 25*4 + 40 + 10 Bonus
const LEVEL_DATA = {
    1: {
        title: "Nivel 1: El mensaje oculto",
        narrative: "Tu primera misión es descifrar un mensaje vital para el planeta. Está en un idioma que solo las máquinas entienden... ¡Binario!",
        instructions: [
            "Descifra la palabra oculta (ej: 'ESPERANZA').",
            "Crea un cartel bonito en Google Docs o Canva.",
            "El cartel debe mostrar la palabra en binario y su traducción.",
            "Pega el enlace público de tu cartel para entregarlo."
        ],
        points: 25,
    },
    2: {
        title: "Nivel 2: La puerta doble",
        narrative: "Un robot jardinero necesita tu ayuda. Solo debe regar si las condiciones son perfectas. ¡Ni una gota de más!",
        instructions: [
            "Abre un proyecto nuevo en Scratch.",
            "Programa un robot (un objeto) que active un riego (otro objeto).",
            "El riego SOLO debe activarse si se cumplen DOS condiciones a la vez (Lógica AND).",
            "Ejemplo: Si hay LUZ (tecla 'L' pulsada) Y hay AGUA (tecla 'A' pulsada).",
            "Pega el enlace público de tu proyecto de Scratch."
        ],
        points: 25,
    },
    3: {
        title: "Nivel 3: Una oportunidad de cambio",
        narrative: "¡Hay demasiada basura! Necesitamos un sistema que detecte CUALQUIER tipo de material reciclable para actuar.",
        instructions: [
            "Programa en Scratch un contenedor inteligente.",
            "El contenedor debe reaccionar (sonido, animación, luz) si se cumple AL MENOS UNA condición (Lógica OR).",
            "Ejemplo: Si detecta PLÁSTICO (tecla 'P') O detecta PAPEL (tecla 'C').",
            "Pega el enlace público de tu proyecto de Scratch."
        ],
        points: 25,
    },
    4: {
        title: "Nivel 4: Buscando soluciones",
        narrative: "La gente no sabe qué reciclar. Vamos a crear una base de datos (una Lista) para ayudarles a encontrar información.",
        instructions: [
            "En Scratch, crea una LISTA (sección 'Variables') llamada 'Reciclables'.",
            "Añade botones para AÑADIR y ELIMINAR objetos de la lista.",
            "Crea una función de BÚSQUEDA: el usuario escribe un texto (ej: 'botella') y el programa dice 'Encontrado' o 'No encontrado'.",
            "Pega el enlace público de tu proyecto de Scratch."
        ],
        points: 25,
    },
    5: {
        title: "Nivel 5: La IA recicladora",
        narrative: "¡Misión final! Vamos a usar Inteligencia Artificial para que la máquina aprenda a clasificar la basura por sí misma.",
        instructions: [
            "Usa 'Machine Learning for Kids' o simula una IA en Scratch.",
            "El objetivo es que la IA identifique 3 tipos de materiales (ej: papel, plástico, lata).",
            "Si usas ML for Kids, entrena un modelo y pega el enlace a tu proyecto de Scratch que lo utiliza.",
            "Si lo simulas en Scratch, explica la lógica en la nota.",
            "Pega el enlace público o sube una captura (usa un enlace a Imgur/Drive por ahora)."
        ],
        points: 40,
    }
};

const PLANET_SPRITES = {
    0: 'https://placehold.co/100x100/050505/555?text=Planeta+0%25', // Planeta triste/contaminado
    25: 'https://placehold.co/100x100/050505/7FEAF6?text=Planeta+25%25', // Empezando a brillar
    50: 'https://placehold.co/100x100/050505/00FF9C?text=Planeta+50%25', // Más verde
    75: 'https://placehold.co/100x100/050505/ADFF2F?text=Planeta+75%25', // Brillante
    100: 'https://placehold.co/100x100/050505/FFFFFF?text=Planeta+100%25' // Restaurado
};

// --- ESTADO DE LA APLICACIÓN ---
 
let db = {
    teamName: '',
    teamClass: '', // Añadido
    evidenceList: [] // { team, teamClass, level, points, note, link, timestamp, validated, sentToDashboard }
};
let currentLevel = null;
let currentView = 'map';

// --- INICIALIZACIÓN ---
 
document.addEventListener('DOMContentLoaded', () => {
    console.log('CODE HOPE Agente listo.');
    loadData();
    initializeApp();
    attachEventListeners();
});

function initializeApp() {
    // Sincronizar UI con datos cargados
    document.getElementById('team-name-input').value = db.teamName;
    document.getElementById('team-class-select').value = db.teamClass; // Añadido
    updateHUD();
    renderMap();
    // Mostrar la vista de mapa por defecto
    navigateTo('map');
}

// --- MANEJO DE DATOS (LocalStorage) ---

function loadData() {
    const team = localStorage.getItem('codeHopeTeam');
    const teamClass = localStorage.getItem('codeHopeTeamClass'); // Añadido
    const evidences = localStorage.getItem('codeHopeEvidenceList');
    
    if (team) {
        db.teamName = team;
    }
    if (teamClass) { // Añadido
        db.teamClass = teamClass;
    }
    if (evidences) {
        try {
            db.evidenceList = JSON.parse(evidences);
        } catch (e) {
            console.error('Error al parsear evidencias:', e);
            db.evidenceList = [];
        }
    }
    console.log('Datos cargados:', db);
}

function saveData() {
    localStorage.setItem('codeHopeTeam', db.teamName);
    localStorage.setItem('codeHopeTeamClass', db.teamClass); // Añadido
    localStorage.setItem('codeHopeEvidenceList', JSON.stringify(db.evidenceList));
    console.log('Datos guardados.');
}

function setTeamName(name) {
    db.teamName = name.trim();
    saveData();
    updateHUD();
}

// Añadida función para guardar clase
function setTeamClass(teamClass) {
    db.teamClass = teamClass;
    saveData();
}

// --- NAVEGACIÓN Y RENDERIZADO ---

function navigateTo(view, levelId = null) {
    console.log(`Navegando a: ${view}, Nivel: ${levelId}`);
    currentView = view;
    currentLevel = levelId;

    // Ocultar todas las vistas
    document.querySelectorAll('.view-container').forEach(el => {
        el.style.display = 'none';
    });

    let viewId = `view-${view}`;

    if (view === 'level') {
        viewId = 'view-level-template';
        populateLevelTemplate(levelId);
    } else if (view === 'dashboard') {
        renderDashboardTable();
    }

    // Mostrar la vista activa
    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.style.display = 'block';
    } else {
        console.error(`Vista no encontrada: ${viewId}`);
        document.getElementById('view-map').style.display = 'block';
    }
    window.scrollTo(0, 0); // Volver arriba
}

function updateHUD() {
    // Actualizar nombre
    document.getElementById('team-name-display').textContent = db.teamName || '---';

    // Actualizar puntos y barra
    let score = 0;
    let validatedCount = 0;
    const completedLevels = new Set();
    
    db.evidenceList.forEach(ev => {
        if (ev.team === db.teamName) {
            if (ev.validated) {
                score += ev.points;
                validatedCount++;
                completedLevels.add(ev.level);
            } else if (!ev.validated && !completedLevels.has(ev.level)) {
                // Contar la primera entrega pendiente si aún no está validada
                score += ev.points;
                completedLevels.add(ev.level);
            }
        }
    });
    
    // Comprobar bonus (simplificado: si los 5 niveles tienen al menos una entrada validada)
    const allValidated = [1, 2, 3, 4, 5].every(level => 
        db.evidenceList.some(ev => ev.team === db.teamName && ev.level === level && ev.validated)
    );
    
    if (allValidated) {
        // Asumimos que el profe añade el bonus. Aquí solo lo mostramos si ya está.
        // Para lógica real, el profe necesitaría un botón "Calcular Final"
    }
    
    // Puntuación provisional (contando no validadas)
    const provisionalScore = getProvisionalScore();
    
    document.getElementById('total-points-display').textContent = provisionalScore;

    // Actualizar barra de progreso
    const progressPercent = (provisionalScore / MAX_POINTS) * 100;
    const expBar = document.getElementById('exp-bar-inner');
    expBar.style.width = `${Math.min(progressPercent, 100)}%`;
    expBar.textContent = `${Math.round(provisionalScore)} pts`;

    // Actualizar planeta
    const planetImg = document.getElementById('planet-sprite');
    if (progressPercent >= 100) planetImg.src = PLANET_SPRITES[100];
    else if (progressPercent >= 75) planetImg.src = PLANET_SPRITES[75];
    else if (progressPercent >= 50) planetImg.src = PLANET_SPRITES[50];
    else if (progressPercent >= 25) planetImg.src = PLANET_SPRITES[25];
    else planetImg.src = PLANET_SPRITES[0];
}

function getProvisionalScore() {
    let score = 0;
    const completedLevels = new Set();
    db.evidenceList
        .filter(ev => ev.team === db.teamName)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Ordenar por fecha
        .forEach(ev => {
            if (!completedLevels.has(ev.level)) {
                score += ev.points;
                completedLevels.add(ev.level);
            }
        });
    
    // Bonus provisional si los 5 están entregados (aunque no validados)
    if (completedLevels.size === 5) {
        score += 10; // Añadir el bonus de 10
    }
    
    return Math.min(score, MAX_POINTS);
}

function renderMap() {
    const completedLevels = new Set(
        db.evidenceList
            .filter(ev => ev.team === db.teamName)
            .map(ev => ev.level)
    );
    const lastCompleted = Math.max(0, ...completedLevels);

    for (let i = 1; i <= 5; i++) {
        const tile = document.getElementById(`tile-level-${i}`);
        const lockOverlay = tile.querySelector('.tile-lock-overlay');
        const badge = tile.querySelector('.tile-badge');

        const isCompleted = completedLevels.has(i);
        const isUnlocked = (i === 1) || (i > 1 && completedLevels.has(i - 1));
        
        if (isUnlocked) {
            tile.classList.add('unlocked');
            tile.classList.remove('locked');
            lockOverlay.style.display = 'none';
            tile.setAttribute('tabindex', '0');
            tile.setAttribute('role', 'button');
        } else {
            tile.classList.add('locked');
            tile.classList.remove('unlocked');
            lockOverlay.style.display = 'flex';
            tile.removeAttribute('tabindex');
            tile.removeAttribute('role');
        }

        if (isCompleted) {
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function populateLevelTemplate(levelId) {
    const data = LEVEL_DATA[levelId];
    if (!data) return;

    document.getElementById('level-title').textContent = data.title;
    document.getElementById('level-narrative').textContent = data.narrative;
    
    const instructionsList = document.getElementById('level-instructions');
    instructionsList.innerHTML = ''; // Limpiar
    data.instructions.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        instructionsList.appendChild(li);
    });
    
    // Limpiar campos
    document.getElementById('level-link-input').value = '';
    document.getElementById('level-note-input').value = '';
    document.getElementById('scratch-ok-badge').style.display = 'none';
    
    // Comprobar si ya existe evidencia
    const existingEvidence = db.evidenceList.find(ev => ev.team === db.teamName && ev.level === levelId);
    const saveButton = document.getElementById('level-save-button');
    const copyButton = document.getElementById('level-copy-button');
    
    if (existingEvidence) {
        document.getElementById('level-link-input').value = existingEvidence.link || '';
        document.getElementById('level-note-input').value = existingEvidence.note || '';
        saveButton.textContent = 'Actualizar Evidencia';
        copyButton.disabled = false;
    } else {
        saveButton.textContent = 'Guardar Evidencia';
        copyButton.disabled = true;
    }
    
    // Validar enlace de scratch al escribir
    const linkInput = document.getElementById('level-link-input');
    const scratchBadge = document.getElementById('scratch-ok-badge');
    linkInput.oninput = () => {
        if (linkInput.value.includes('scratch.mit.edu')) {
            scratchBadge.style.display = 'block';
        } else {
            scratchBadge.style.display = 'none';
        }
    };
}

function renderDashboardTable() {
    const tbody = document.getElementById('dashboard-table-body');
    tbody.innerHTML = ''; // Limpiar
    
    const teamFilter = document.getElementById('filter-team').value.toLowerCase();
    const levelFilter = document.getElementById('filter-level').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    const filteredList = db.evidenceList.filter(ev => {
        const teamMatch = !teamFilter || ev.team.toLowerCase().includes(teamFilter) || (ev.teamClass && ev.teamClass.toLowerCase().includes(teamFilter));
        const levelMatch = !levelFilter || ev.level == levelFilter;
        const statusMatch = !statusFilter || 
            (statusFilter === 'pending' && !ev.validated && !ev.correctionNote) ||
            (statusFilter === 'validated' && ev.validated) ||
            (statusFilter === 'correction' && !!ev.correctionNote); // Asumimos que 'correction' tiene 'correctionNote'
        
        return teamMatch && levelMatch && statusMatch;
    });
    
    if (filteredList.length === 0) {
         tbody.innerHTML = '<tr><td colspan="8" class="text-center p-8">No hay evidencias que coincidan con los filtros.</td></tr>';
         return;
    }
    
    filteredList.forEach(ev => {
        const tr = document.createElement('tr');
        tr.dataset.id = ev.timestamp; // Usar timestamp como ID único
        
        let statusText = '<span class="status-pending">Pendiente</span>';
        if (ev.validated) {
            statusText = '<span class="status-validated">Validado</span>';
        } else if (ev.correctionNote) {
            statusText = `<span class="status-correction">Corrección (${ev.correctionNote})</span>`;
        }

        tr.innerHTML = `
            <td>${ev.team} (${ev.teamClass || 'N/A'})</td>
            <td>${ev.level}</td>
            <td>${ev.points}</td>
            <td><a href="${ev.link}" target="_blank" class="text-accent underline truncate" style="max-width: 150px; display: block;">${ev.link}</a></td>
            <td class="text-sm">${ev.note}</td>
            <td class="text-sm">${new Date(ev.timestamp).toLocaleString('es-ES')}</td>
            <td>${statusText}</td>
            <td class="flex flex-col gap-1">
                <button class="action-button" data-action="view" data-link="${ev.link}">Ver</button>
                <button class="action-button validate" data-action="validate" data-id="${ev.timestamp}">Validar</button>
                <button class="action-button" data-action="correct" data-id="${ev.timestamp}">Corrección</button>
                <button class="action-button" data-action="classdojo" data-id="${ev.timestamp}">ClassDojo</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Añadir listeners a los nuevos botones
    attachDashboardActionListeners();
}

function renderEvidencesModal() {
    const container = document.getElementById('evidences-list-container');
    container.innerHTML = '';
    
    const teamEvidences = db.evidenceList.filter(ev => ev.team === db.teamName);
    
    if (teamEvidences.length === 0) {
        container.innerHTML = '<p class="text-gray-400">Aún no has guardado ninguna evidencia.</p>';
        return;
    }
    
    teamEvidences.forEach(ev => {
        let statusText = 'Pendiente de revisión';
        let statusClass = 'text-gray-400';
        if (ev.validated) {
            statusText = '¡Validado!';
            statusClass = 'text-green-400';
        } else if (ev.correctionNote) {
            statusText = `Corrección: ${ev.correctionNote}`;
            statusClass = 'text-yellow-500';
        }
        
        const div = document.createElement('div');
        div.className = 'p-3 bg-gray-800 border-l-4 border-accent';
        div.innerHTML = `
            <p class="font-bold text-white">Nivel ${ev.level} (+${ev.points} pts)</p>
            <p class="text-sm ${statusClass}">${statusText}</p>
            <a href="${ev.link}" target="_blank" class="text-sm text-accent underline">Ver entrega</a>
        `;
        container.appendChild(div);
    });
    
    openModal('modal-evidences');
}

// --- MANEJO DE EVENTOS ---
 
function attachEventListeners() {
    // Input de Nombre de Equipo
    document.getElementById('team-name-input').addEventListener('change', (e) => {
        setTeamName(e.target.value);
    });

    // Selector de Aula
    document.getElementById('team-class-select').addEventListener('change', (e) => {
        setTeamClass(e.target.value);
    });

    // Botones de Navegación (Tablero, Guía, Dashboard)
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            navigateTo(e.currentTarget.dataset.view);
        });
    });

    // Tiles de Nivel
    document.querySelectorAll('.nav-level').forEach(tile => {
        tile.addEventListener('click', (e) => {
            if (tile.classList.contains('unlocked')) {
                navigateTo('level', e.currentTarget.dataset.level);
            } else {
                showErrorModal('¡Nivel bloqueado! Completa el nivel anterior para desbloquear este.');
            }
        });
        // Accesibilidad: permitir "click" con tecla Enter
        tile.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && tile.classList.contains('unlocked')) {
                navigateTo('level', e.currentTarget.dataset.level);
            }
        });
    });
    
    // Botones de Nivel
    document.getElementById('level-save-button').addEventListener('click', handleSaveEvidence);
    document.getElementById('level-preview-button').addEventListener('click', handleScratchPreview);
    document.getElementById('level-copy-button').addEventListener('click', handleCopyEvidence);

    // Botones de Modales
    document.getElementById('show-evidences-button').addEventListener('click', renderEvidencesModal);
    
    // Filtros del Dashboard
    document.getElementById('filter-team').addEventListener('input', renderDashboardTable);
    document.getElementById('filter-level').addEventListener('change', renderDashboardTable);
    document.getElementById('filter-status').addEventListener('change', renderDashboardTable);
    
    // Botones de acción del Dashboard
    document.getElementById('dashboard-refresh').addEventListener('click', () => {
        loadData(); // Recargar desde localStorage
        renderDashboardTable();
        showToast('Datos refrescados desde LocalStorage.');
    });
    document.getElementById('dashboard-export-csv').addEventListener('click', handleExportCSV);
}

function attachDashboardActionListeners() {
    document.querySelectorAll('#dashboard-table .action-button').forEach(btn => {
        // Prevenir doble listener
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('#dashboard-table .action-button').forEach(btn => {
        btn.addEventListener('click', handleDashboardAction);
    });
}

// --- LÓGICA DE ACCIONES ---

function handleSaveEvidence() {
    const teamName = db.teamName;
    const teamClass = db.teamClass; // Añadido
    const link = document.getElementById('level-link-input').value.trim();
    
    // Validación
    if (!teamName || !teamClass) { // Modificado
        showErrorModal('¡Agente, necesitas un nombre Y un aula! Revisa el Tablero antes de guardar.');
        return;
    }
    if (!link) {
        showErrorModal('¡Falta la evidencia! Pega el enlace de tu proyecto (Scratch, Docs, etc.) para poder guardar.');
        return;
    }
    
    const level = currentLevel;
    const data = LEVEL_DATA[level];
    const note = document.getElementById('level-note-input').value.trim();
    
    const evidence = {
        team: teamName,
        teamClass: teamClass, // Añadido
        level: parseInt(level),
        points: data.points,
        note: note,
        link: link,
        timestamp: new Date().toISOString(),
        validated: false,
        sentToDashboard: false, // (No se usa activamente aquí, pero se guarda)
        correctionNote: null
    };
    
    // Comprobar si es una actualización o uno nuevo
    const existingIndex = db.evidenceList.findIndex(ev => ev.team === teamName && ev.level === parseInt(level));
    
    if (existingIndex > -1) {
        // Actualizar (y resetear validación si cambia el link)
        const oldEvidence = db.evidenceList[existingIndex];
        evidence.validated = oldEvidence.link === link ? oldEvidence.validated : false; // Resetea validación si el link cambia
        evidence.correctionNote = oldEvidence.link === link ? oldEvidence.correctionNote : null;
        db.evidenceList[existingIndex] = evidence;
        showToast(`Evidencia del Nivel ${level} actualizada. ¡+${data.points} pts (pendientes)!`);
    } else {
        // Nuevo
        db.evidenceList.push(evidence);
        showToast(`¡Genial, ${teamName}! Evidencia del Nivel ${level} guardada. ¡+${data.points} pts (pendientes)!`);
    }
    
    saveData();
    updateHUD();
    renderMap();
    
    // Activar botón de copiar
    document.getElementById('level-copy-button').disabled = false;
    
    // Comprobar victoria
    const completedLevels = new Set(
        db.evidenceList
            .filter(ev => ev.team === db.teamName)
            .map(ev => ev.level)
    );
    if (completedLevels.size === 5) {
        handleVictory();
    }
    
    // Volver al mapa
    setTimeout(() => navigateTo('map'), 1000);
}

function handleCopyEvidence() {
    const teamName = db.teamName;
    const level = currentLevel;
    const evidence = db.evidenceList.find(ev => ev.team === teamName && ev.level === parseInt(level));
    
    if (!evidence) {
        showErrorModal('No se encontró la evidencia para copiar.');
        return;
    }
    
    const textToCopy = `
EVIDENCIA: Equipo: ${evidence.team} (Aula: ${evidence.teamClass || 'N/A'})
Nivel: ${evidence.level}
Puntos: ${evidence.points}
Timestamp: ${evidence.timestamp}
Nota: ${evidence.note}
Link: ${evidence.link}
    `.trim();
    
    copyToClipboard(textToCopy);
    showToast('¡Evidencia copiada al portapapeles!');
}

function handleScratchPreview() {
    const link = document.getElementById('level-link-input').value;
    const embedUrl = getScratchEmbedUrl(link);
    const container = document.getElementById('scratch-embed-container');
    const fallback = document.getElementById('scratch-fallback-message');
    const openLink = document.getElementById('scratch-open-link');

    container.innerHTML = '';
    openLink.href = link;
    
    if (embedUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.className = 'w-full h-full';
        container.appendChild(iframe);
        fallback.style.display = 'block'; // Mostrar siempre el fallback
    } else {
        container.innerHTML = '<p class="text-red-500 text-center p-8">No parece un enlace de Scratch válido. (Debe ser .../projects/ID/...)</p>';
        fallback.style.display = 'none';
    }
    
    openModal('modal-scratch-preview');
}

function handleDashboardAction(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const timestamp = btn.dataset.id || btn.closest('tr').dataset.id;
    
    const evidenceIndex = db.evidenceList.findIndex(ev => ev.timestamp === timestamp);
    if (evidenceIndex === -1) {
        showErrorModal('Error: No se encontró la evidencia.');
        return;
    }
    
    let evidence = db.evidenceList[evidenceIndex];
    
    switch(action) {
        case 'view':
            const link = btn.dataset.link;
            if (link.includes('scratch.mit.edu')) {
                // Usar el modal de preview
                const embedUrl = getScratchEmbedUrl(link);
                const container = document.getElementById('scratch-embed-container');
                const fallback = document.getElementById('scratch-fallback-message');
                const openLink = document.getElementById('scratch-open-link');
                container.innerHTML = '';
                openLink.href = link;
                if (embedUrl) {
                    const iframe = document.createElement('iframe');
                    iframe.src = embedUrl;
                    iframe.className = 'w-full h-full aspect-video'; // Mantenido aspect-video
                    container.appendChild(iframe);
                    fallback.style.display = 'block';
                }
                openModal('modal-scratch-preview');
            } else {
                // Abrir en nueva pestaña
                window.open(link, '_blank');
            }
            break;
        
        case 'validate':
            evidence.validated = true;
            evidence.correctionNote = null;
            db.evidenceList[evidenceIndex] = evidence;
            saveData();
            renderDashboardTable();
            showToast(`Evidencia de ${evidence.team} (Nivel ${evidence.level}) VALIDADA.`);
            break;
            
        case 'correct':
            const note = prompt('Añade una nota de corrección para el equipo (o deja en blanco para marcar "Pendiente"):');
            if (note !== null) { // Si no pulsa "Cancelar"
                evidence.validated = false;
                evidence.correctionNote = note || 'Revisar, por favor.';
                db.evidenceList[evidenceIndex] = evidence;
                saveData();
                renderDashboardTable();
                showToast(`Evidencia de ${evidence.team} marcada para CORRECCIÓN.`);
            }
            break;
            
        case 'classdojo':
            const dojoText = `Asignar ${evidence.points} pts a Equipo ${evidence.team} en ClassDojo — motivo: Nivel ${evidence.level} validado. Evidencia: ${evidence.link}`;
            copyToClipboard(dojoText);
            showToast('¡Texto para ClassDojo copiado!');
            break;
    }
}

function handleExportCSV() {
    if (db.evidenceList.length === 0) {
        showErrorModal('No hay evidencias para exportar.');
        return;
    }
    
    const headers = ['Equipo', 'Aula', 'Nivel', 'Puntos', 'Link', 'Nota', 'Timestamp', 'Validado', 'NotaCorreccion'];
    let csvContent = headers.join(',') + '\n';
    
    const listToExport = db.evidenceList; // Podríamos usar la lista filtrada
    
    listToExport.forEach(ev => {
        const row = [
            `"${ev.team}"`,
            `"${ev.teamClass || ''}"`,
            ev.level,
            ev.points,
            `"${ev.link}"`,
            `"${(ev.note || '').replace(/"/g, '""')}"`,
            ev.timestamp,
            ev.validated,
            `"${(ev.correctionNote || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `code_hope_evidencias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleVictory() {
    const score = getProvisionalScore(); // Usar la puntuación calculada
    document.getElementById('victory-score-display').textContent = `Puntuación: ${score} pts`;
    openModal('modal-victory');
    // Aquí podríamos añadir un sonido si tuviéramos Tone.js
}

// --- UTILIDADES ---

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
        // Detener embed de scratch si existe
        if (modalId === 'modal-scratch-preview') {
            document.getElementById('scratch-embed-container').innerHTML = '';
        }
    }
}

function showErrorModal(message) {
    document.getElementById('modal-error-message').textContent = message;
    openModal('modal-error');
}

let toastTimer;
function showToast(message) {
    const toast = document.getElementById('toast-feedback');
    toast.textContent = message;
    toast.classList.add('show');
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function getScratchEmbedUrl(link) {
    if (!link) return null;
    const match = link.match(/projects\/(\d+)/);
    if (match && match[1]) {
        return `https://scratch.mit.edu/projects/${match[1]}/embed`;
    }
    return null;
}

function copyToClipboard(text) {
    // Usar 'document.execCommand' como fallback para entornos restrictivos (iFrames)
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // Evitar scroll
    textArea.style.top = 0;
    textArea.style.left = 0;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (!successful) {
            console.warn('Fallback: No se pudo copiar al portapapeles.');
            showErrorModal('No se pudo copiar. Es posible que tu navegador no lo soporte.');
        }
    } catch (err) {
        console.error('Fallback: Error al copiar', err);
    }
    document.body.removeChild(textArea);
}

// Cerrar modales al hacer clic fuera (en el backdrop)
document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});