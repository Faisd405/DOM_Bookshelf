const bookShelf = []
const RENDER_EVENT = 'render-bookShelf';
const SAVED_EVENT = 'saved-bookShelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

// Check Browser Storage
function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

// Load Data
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const bookShelfData of data) {
            bookShelf.push(bookShelfData);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Load Content DOM
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBookshelf();
    });
    
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBookshelf();
    });
});

// Add Bookshelf
function addBookshelf() {
    const title = document.getElementById('judul').value;
    const author = document.getElementById('penulis').value;
    const year = document.getElementById('tahun').value;
    const onComplete = document.getElementById('onComplete').checked;

    const generatedID = generateId();
    const bookshelfObject = generateBookshelfObject(generatedID, title, author, year, onComplete);
    bookShelf.push(bookshelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Generate ID from Date
function generateId() {
    return +new Date();
}

// Generate Bookshelf Object
function generateBookshelfObject(id, title, author, year, onComplete) {
    return {
        id,
        title,
        author,
        year,
        onComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    for (const bookshelfObject of bookShelf) {
        const bookshelfElement = makeBookshelf(bookshelfObject);
        if (bookshelfObject.onComplete) {
            completeBookshelfList.append(bookshelfElement);
        } else {
            incompleteBookshelfList.append(bookshelfElement);
        }
    }
});

function makeBookshelf(bookshelfObject) {
    const textJudul = document.createElement('h4');
    textJudul.innerText = bookshelfObject.title;

    const textPenulis = document.createElement('p');
    textPenulis.innerText = bookshelfObject.author;

    const textTahun = document.createElement('p');
    textTahun.classList.add('text-muted');
    textTahun.innerText = bookshelfObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('p2');
    textContainer.append(textJudul, textPenulis, textTahun);

    const container = document.createElement('div');
    container.classList.add('card', 'card-body', 'mb-3');
    container.append(textContainer);
    container.setAttribute('id', bookshelfObject.id);

    if (bookshelfObject.onComplete) {
        container.classList.add('border-success');
        textJudul.classList.add('text-success');
        textPenulis.classList.add('text-success');

        const undoButton = document.createElement('button');
        undoButton.classList.add('btn', 'btn-sm', 'btn-outline-warning', 'mr-2');
        undoButton.innerText = 'Belum Selesai';

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookshelfObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');
        trashButton.innerText = 'Hapus';

        trashButton.addEventListener('click', function () {
            deleteTask(bookshelfObject.id);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('btn-group', 'float-right');
        buttonContainer.append(undoButton, trashButton);

        container.append(buttonContainer);
    } else {
        container.classList.add('border-warning');
        textJudul.classList.add('text-warning');
        textPenulis.classList.add('text-warning');

        const undoButton = document.createElement('button');
        undoButton.classList.add('btn', 'btn-sm', 'btn-outline-success', 'mr-2');
        undoButton.innerText = 'Selesai';

        undoButton.addEventListener('click', function () {
            completeTask(bookshelfObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');
        trashButton.innerText = 'Hapus';

        trashButton.addEventListener('click', function () {
            deleteTask(bookshelfObject.id);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('btn-group', 'float-right');
        buttonContainer.append(undoButton, trashButton);

        container.append(buttonContainer);
    }

    return container;
}

function completeTask(id) {
    for (const bookshelfObject of bookShelf) {
        if (bookshelfObject.id === id) {
            bookshelfObject.onComplete = true;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }
}

function undoTaskFromCompleted(id) {
    for (const bookshelfObject of bookShelf) {
        if (bookshelfObject.id === id) {
            bookshelfObject.onComplete = false;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }
}

function deleteTask(id) {
    for (let i = 0; i < bookShelf.length; i++) {
        if (bookShelf[i].id === id) {
            bookShelf.splice(i, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }
}

function searchBookshelf() {
    const search = document.getElementById('cari').value;

    // Filter
    const filteredBookshelf = bookShelf.filter(function (bookshelfObject) {
        return bookshelfObject.title.toLowerCase().includes(search.toLowerCase()) || bookshelfObject.author.toLowerCase().includes(search.toLowerCase());
    });

    // Render
    document.getElementById('incompleteBookshelfList').innerHTML = '';
    document.getElementById('completeBookshelfList').innerHTML = '';


    for (const bookshelfObject of filteredBookshelf) {
        const bookshelfElement = makeBookshelf(bookshelfObject);
        if (bookshelfObject.onComplete) {
            document.getElementById('completeBookshelfList').append(bookshelfElement);
        } else {
            document.getElementById('incompleteBookshelfList').append(bookshelfElement);
        }
    }
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookShelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}