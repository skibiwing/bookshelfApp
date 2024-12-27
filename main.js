document.addEventListener('DOMContentLoaded', ()=>{
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit',(event)=>{
        event.preventDefault();
        addBook();
    })

    const checkBox = document.getElementById('bookFormIsComplete');
    const textSpan = document.getElementById('textSpan');
    checkBox.addEventListener('change', ()=> {
        textSpan.innerText = checkBox.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    })

    const searchSubmit = document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', (event)=> {
        event.preventDefault();
        searchForBook();
    })

    const searchClear = document.getElementById('searchClear');
    searchClear.addEventListener('click', (event)=> {
        event.preventDefault();
        restoreOriginalBookList();
    })
    if(ifStorageExist) {
        loadDataFromStorage();
    }    
})

const RENDER_EVENT = 'render-bookshelf';

document.addEventListener(RENDER_EVENT,()=>{
    console.log(datas)

    const unfinished = document.getElementById('incompleteBookList');
    unfinished.innerHTML = '';

    const finished = document.getElementById('completeBookList');
    finished.innerHTML = '';
    
    for (const bookData of datas) {
        const books = addToHTML(bookData);
        if(!bookData.isComplete ) {
            unfinished.append(books);
        }
        
        else {
            finished.append(books);
        }
    }
})

const datas = [];
function addBook() {
    const checkBox = document.getElementById('bookFormIsComplete');
    const id = generateId()
    const getTitle = document.getElementById('bookFormTitle').value;
    const getAuthor = document.getElementById('bookFormAuthor').value;
    const getYear = Number(document.getElementById('bookFormYear').value);
    const bookObject = generateObject(id, getTitle, getAuthor, getYear, checkBox.checked);

    datas.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateObject(id, title, author, year, isComplete) {
    return {id, title, author, year, isComplete}
}

function addToHTML(bookObject) {
    const {id, title, author, year, isComplete} = bookObject;    
    
    const finishedContainer = document.createElement('div');
    const textTitle = document.createElement('h3');
    const textAuthor = document.createElement('p');
    const textYear = document.createElement('p');

    textTitle.innerText= bookObject.title;
    textTitle.setAttribute('data-testid', 'bookItemTitle');
    
    
    textAuthor.innerText =`Penulis : ${bookObject.author}`;
    textAuthor.setAttribute('data-testid', 'bookItemAuthor')
    
    textYear.innerText = `Tahun : ${bookObject.year}` ;
    textYear.setAttribute('data-testid', 'bookItemYear');

    const buttonContainer = document.createElement('div');
    const finishReadButton = document.createElement('button');

    const delButton = document.createElement('button');
    delButton.innerText = 'Hapus buku'
    delButton.setAttribute('data-testid', 'bookItemDeleteButton');
    delButton.style.backgroundColor = 'darkred'
    delButton.addEventListener('click', ()=>{
        eraseBook(id);
    })

    const editButton = document.createElement('button');
    editButton.innerText = 'Edit buku';
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.style.backgroundColor = 'darkgreen'
    editButton.addEventListener('click', ()=> {
        const editContainer = document.getElementById('forEditBook');
        editContainer.style.display = 'inline';
    })

    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', ()=> {
        const editContainer = document.getElementById('forEditBook');
        editContainer.style.display = 'none';
        editBook(bookObject.id);
    })

    const cancelButton = document.getElementById('cancel');
    cancelButton.addEventListener('click', ()=> {
        const editContainer = document.getElementById('forEditBook');
        editContainer.style.display = 'none';
        editBook(bookObject.id);
    })

    finishReadButton.setAttribute('data-testid', 'bookItemIsCompleteButton');    
    finishedContainer.setAttribute('data-testid', 'bookItem');

    if(isComplete) {
        finishedContainer.classList.add('dataFinished');
        finishedContainer.setAttribute('data-bookid', id);

        buttonContainer.setAttribute('class', 'buttonFinished');

        finishReadButton.innerText = 'Belum Selesai dibaca';

        finishReadButton.addEventListener('click', ()=> {
            unfinishedRead(bookObject.id);
        })

        buttonContainer.append(finishReadButton, delButton, editButton);
        finishedContainer.append(textTitle, textAuthor, textYear, buttonContainer);
    }
    else {
        finishedContainer.classList.add('dataUnfinished');
        finishedContainer.setAttribute('data-bookid', id);
                
        buttonContainer.setAttribute('class', 'buttonUnfinished');

        finishReadButton.innerText = 'Selesai dibaca'

        finishReadButton.addEventListener('click', ()=> {
            finishedRead(bookObject.id);
        })
        
        buttonContainer.append(finishReadButton, delButton, editButton);
        finishedContainer.append(textTitle, textAuthor, textYear, buttonContainer);
    
    }
    return finishedContainer
}

function eraseBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget == -1) {
        return -1;
    }

    datas.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function unfinishedRead(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget === null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function finishedRead(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget === null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function findBook(bookId) {
    for (const bookItem of datas) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for(const index in datas) {
        if(datas[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

const STORAGE_KEY = 'BOOK'
const SAVED_EVENT = 'saved-bookshelf'
function ifStorageExist() {
    if(typeof(Storage) === undefined) {
        alert('Browser tidak mendukung local storage')
        return false;
    }
    return true;
}

function saveData() {
    if(ifStorageExist()) {
        const value = JSON.stringify(datas);
        localStorage.setItem(STORAGE_KEY, value)
        document.dispatchEvent(new Event(SAVED_EVENT));
    }    
}

document.addEventListener(SAVED_EVENT, ()=> {
    console.log('Data berhasil disimpan');
})

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null) {
        for (const item of data ) {
            datas.push(item)
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBook(bookId) {
    const bookTarget = findBook(bookId);
    const editTitle = document.getElementById('editBookFormTitle').value;
    const editAuthor = document.getElementById('editBookFormAuthor').value;
    const editYear = document.getElementById('editBookFormYear').value;
    bookTarget.title = editTitle || bookTarget.title;
    bookTarget.author = editAuthor || bookTarget.author;
    bookTarget.year = editYear || bookTarget.year;
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
}

function searchForBook() {
    const searchInput = document.getElementById('searchBookTitle').value.trim().toLowerCase();
    const bookTarget = datas.filter((book)=> book.title.toLowerCase().includes(searchInput));

    const unfinished = document.getElementById('incompleteBookList');
    unfinished.innerHTML = '';

    const finished = document.getElementById('completeBookList');
    finished.innerHTML = '';

    if(bookTarget.length>0) {
        bookTarget.forEach((book)=> {
            const container = document.createElement('div');
            container.classList.add('dataFinished');
            container.classList.add(book.isComplete? "dataFinished": "dataUnfinished");
            container.setAttribute('data-bookid', book.id);

            container.innerHTML = `
                <h3 data-testid="bookItemTitle">${book.title}</h3>
                <p data-testid="bookItemAuthor">Penulis : ${book.author}</p>
                <p data-testid="bookItemYear">Tahun : ${book.year}</p>
                <div class="${book.isComplete ? 'buttonFinished' : 'buttonUnfinished'}">
                    <button data-testid="bookItemIsCompleteButton">${book.isComplete ? 'Belum Selesai dibaca' : 'Selesai dibaca'}</button>
                    <button data-testid="bookItemDeleteButton" style="background-color: darkred;">Hapus buku</button>
                    <button data-testid="bookItemEditButton" style="background-color: darkgreen;">Edit buku</button>
                </div>
            `;

            if(book.isComplete) {
                finished.appendChild(container);
            }
            else {
                unfinished.appendChild(container);
            }
        })
    }
    else {
        unfinished.innerHTML, finished.innerHTML = `<h3>Buku tidak ditemukan</h3>`
    }
}

function restoreOriginalBookList() {
    const incompleteList = document.getElementById('incompleteBookList');
    const completeList = document.getElementById('completeBookList');
    
    incompleteList.innerHTML = '';
    completeList.innerHTML = '';
    
    datas.forEach((book) => {
        const bookItem = document.createElement('div');
        bookItem.setAttribute('data-testid', 'bookItem');
        bookItem.classList.add(book.isComplete ? 'dataFinished' : 'dataUnfinished');
        bookItem.setAttribute('data-bookid', book.id);

        bookItem.innerHTML = `
            <h3 data-testid="bookItemTitle">${book.title}</h3>
            <p data-testid="bookItemAuthor">Penulis : ${book.author}</p>
            <p data-testid="bookItemYear">Tahun : ${book.year}</p>
            <div class="${book.isComplete ? 'buttonFinished' : 'buttonUnfinished'}">
                <button data-testid="bookItemIsCompleteButton">${book.isComplete ? 'Belum Selesai dibaca' : 'Selesai dibaca'}</button>
                <button data-testid="bookItemDeleteButton" style="background-color: darkred;">Hapus buku</button>
                <button data-testid="bookItemEditButton" style="background-color: darkgreen;">Edit buku</button>
            </div>
        `;

        if (book.isComplete) {
            completeList.appendChild(bookItem);
        } else {
            incompleteList.appendChild(bookItem);
        }
    });
}
