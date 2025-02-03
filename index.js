async function fetchFilters() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");

        if (!response.ok) {
            console.error(`Erreur lors de la récupération des catégories : ${response.status}`);
            return;
        }

        const categories = await response.json();
        const filtersContainer = document.querySelector('.filters');

        const allButton = document.createElement('button');
        allButton.classList.add('filter-button');
        allButton.classList.add('active');
        allButton.textContent = "Tous";

        allButton.addEventListener('click', () => {
            setActiveButton(allButton);
            fetchProjects();
        });

        filtersContainer.appendChild(allButton);

        categories.forEach(function (category) {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.textContent = category.name;

            button.addEventListener('click', () => {
                setActiveButton(button);
                fetchProjects(category.id);
            });
            filtersContainer.appendChild(button);
        });
    } catch (e) {
        console.log(e);
    }
}

function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach(button => button.classList.remove('active'));

    activeButton.classList.add('active');
}

async function fetchProjects(categoryId = 0) {
    try {
        const response = await fetch("http://localhost:5678/api/works");

        if (!response.ok) {
            console.error(`Erreur lors de la récupération des projets : ${response.status}`);
            return;
        }

        const works = await response.json();
        const gallery = document.querySelector('.gallery');
        gallery.innerHTML = ""; 

        let filteredWorks = works.filter(function (work) {
            return work.categoryId === categoryId;
        });
        if (categoryId === 0) {
            filteredWorks = works
        }

        filteredWorks.forEach(function (work) {
            const projectElement = document.createElement('figure');
            const imageElement = document.createElement('img');
            const captionElement = document.createElement('figcaption');

            imageElement.src = work.imageUrl;
            imageElement.alt = work.title;
            captionElement.textContent = work.title;

            projectElement.appendChild(imageElement);
            projectElement.appendChild(captionElement);
            gallery.appendChild(projectElement);
        });
    } catch (e) {
        console.log(e);
    }
}

function openModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');

    const modalGallery = document.getElementById('modal-gallery-container');
    modalGallery.classList.remove('hidden');

    const formContainer = document.getElementById('formContainer');
    formContainer.classList.add('hidden');

    // Fermer la modal en cliquant à l'extérieur
    modal.addEventListener('click', closeOnOutsideClick);

    // Fermer la modal avec la touche Échap
    document.addEventListener('keydown', closeOnEscape);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    document.getElementById('backButton').classList.add('hidden');

    // Nettoyer les événements pour éviter les doublons
    modal.removeEventListener('click', closeOnOutsideClick);
    document.removeEventListener('keydown', closeOnEscape);
    const divInfosPhoto = document.getElementById("infos-photo");
    divInfosPhoto.classList.remove('hidden');
}

// Fonction pour détecter un clic à l'extérieur de la modal
function closeOnOutsideClick(event) {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent.contains(event.target)) {
        closeModal();
    }
}

// Fonction pour détecter la touche Échap
function closeOnEscape(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

async function loadModalGallery() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            console.error(`Erreur lors de la récupération des projets : ${response.status}`);
            return;
        }

        const works = await response.json();
        const modalGallery = document.getElementById('modal-gallery');
        modalGallery.innerHTML = "";

        works.forEach(function (work) {
            const htmlElement = `
            <div class="modal-item" style="background-image: url('${work.imageUrl}'); position: relative;">
                <button id="delete-${work.id}" class="delete-btn" aria-label="Supprimer">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>`;
            modalGallery.insertAdjacentHTML('beforeend', htmlElement);

            const buttonDelete = document.querySelector(`#delete-${work.id}`);
            buttonDelete.addEventListener('click', () => {
                removeWork(work.id);
            });
        });

        const categoryResponse = await fetch('http://localhost:5678/api/categories');
        const categories = await categoryResponse.json();
        let categorySelect = document.querySelector('#category');

        while (categorySelect.firstChild) {
            categorySelect.removeChild(categorySelect.firstChild);
        }

        const optionEmpty = document.createElement('option');
            optionEmpty.textContent = "";
            optionEmpty.value = "";
            categorySelect.appendChild(optionEmpty);

        categories.forEach((category) => {
            const option = document.createElement('option');
            option.textContent = category.name;
            option.value = category.id;
            categorySelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

async function removeWork(workId) {
    var authToken = localStorage.getItem('authToken');
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${authToken}`,
                contentType: 'application/json'
            }
        });
        loadModalGallery();
        fetchProjects();
    } catch (e) {
        console.log(e);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const isConnected = localStorage.getItem('authToken') != null;
    document.getElementById('boutonlogout').addEventListener('click', () => {
        localStorage.clear();
        location.reload();
        });
    const filtersContainer = document.querySelector('.filters');
    const boutonModal = document.getElementById('openModal');
    if (isConnected) {
        boutonModal.classList.remove('hidden');
        document.getElementById('login').classList.add('hidden');
        document.getElementById('logout').classList.remove('hidden');
        filtersContainer.classList.add('hidden');
        document.getElementById('edit-mode-bar').classList.remove('hidden');
    }
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('openModal').addEventListener('click', function () {
        openModal();
        loadModalGallery();
    });

    document.getElementById('addphoto').addEventListener('click', function () {
        document.getElementById('backButton').classList.remove('hidden');

        const modalGallery = document.getElementById('modal-gallery-container');
        modalGallery.classList.add('hidden');

        const formContainer = document.getElementById('formContainer');
        formContainer.classList.remove('hidden');
    });

    document.getElementById('photoForm').addEventListener('submit', async function (event) {
        event.preventDefault(); 
        const errorMessage = document.getElementById('modal-error-message');
        const formData = new FormData(this);

        if (!formData.get('image') || !formData.get('title') || !formData.get('category')) {
            errorMessage.classList.remove('hidden');
            return;
        }
        try {
            await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                headers: {
                    contentType: 'multipart/form-data',
                    authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: formData
            });
            fetchProjects();
            loadModalGallery();
            closeModal();
        } catch (e) {
            errorMessage.classList.remove("hidden");
        }
    });

    document.getElementById('image').addEventListener('change', function (event) {
        const file = event.target.files[0];
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = ''; 
        const divInfosPhoto = document.getElementById("infos-photo");
        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewContainer.appendChild(img);
            };

            reader.readAsDataURL(file);
            divInfosPhoto.classList.add('hidden');
        } else {
            divInfosPhoto.classList.remove('hidden');
        }
    });

    document.getElementById('backButton').addEventListener('click', function(event){
        this.classList.add('hidden');

        resetForm();

        const divInfosPhoto = document.getElementById("infos-photo");
        divInfosPhoto.classList.remove('hidden');
        
        const modalGallery = document.getElementById('modal-gallery-container');
        modalGallery.classList.remove('hidden');
    
        const formContainer = document.getElementById('formContainer');
        formContainer.classList.add('hidden');

        
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("photoForm");
    const submitButton = form.querySelector("button[type='submit']");

    // Désactive le bouton au chargement
    submitButton.disabled = true;

    // Écoute les changements et les saisies pour valider en temps réel
    form.addEventListener("input", validateForm);
    form.addEventListener("change", validateForm);
    const img = document.getElementById("imagePreview");
    const imageInput = document.getElementById("image");
    img.addEventListener('click', () => imageInput.click());
});

function validateForm() {
    const imageInput = document.getElementById("image").files.length > 0; // Vérifie si une photo est sélectionnée
    const titleInput = document.getElementById("title").value.trim() !== ""; // Vérifie que le champ "Titre" est rempli
    const categoryInput = document.getElementById("category").value !== ""; // Vérifie qu'une catégorie est sélectionnée

    // Active ou désactive le bouton selon la validité
    const form = document.getElementById("photoForm");
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = !(imageInput && titleInput && categoryInput);
}

function resetForm() {
    const form = document.getElementById("photoForm");
    form.reset(); // Réinitialise tous les champs du formulaire

    const imagePreview = document.getElementById("imagePreview");
    imagePreview.innerHTML = ""; // Efface l'aperçu de l'image
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('openModal').addEventListener('click', function () {
        resetForm(); // Réinitialise les champs du formulaire
        openModal(); // Ouvre la modal
        loadModalGallery(); // Recharge la galerie dans la modal
    });
});



fetchFilters();
fetchProjects();
