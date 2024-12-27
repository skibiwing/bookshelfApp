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
    delButton.setAttribute('id', 'del')
    delButton.style.backgroundColor = 'darkred'
    delButton.addEventListener('click', ()=>{
        eraseBook(id);
    })

    const editButton = document.createElement('button');
    editButton.innerText = 'Edit buku';
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.setAttribute('id', 'edit')
    editButton.style.backgroundColor = 'darkgreen'
    editButton.addEventListener('click', ()=> {
        const editContainer = document.getElementById('forEditBook');
        editContainer.style.display = 'inline';

        document.getElementById('editBookFormTitle').value = title;
        document.getElementById('editBookFormAuthor').value = author;
        document.getElementById('editBookFormYear').value = year;
    
        const saveButton = document.getElementById('save');
        const saveHandler =  ()=> {
            editBook(id);
            cleanUp()
        }
        saveButton.addEventListener('click', saveHandler);
    
        const cancelButton = document.getElementById('cancel');
        const cancelHandler =  ()=> {
            editContainer.style.display = 'none';
            cleanUp()
        }
        cancelButton.addEventListener('click', cancelHandler);

        const cleanUp = ()=> {
            saveButton.removeEventListener('click', saveHandler);
            cancelButton.removeEventListener('click', cancelHandler);
        }

    })

    finishReadButton.setAttribute('data-testid', 'bookItemIsCompleteButton');    
    finishedContainer.setAttribute('data-testid', 'bookItem');

    if(isComplete) {
        finishedContainer.classList.add('dataFinished');
        finishedContainer.setAttribute('data-bookid', id);

        buttonContainer.setAttribute('class', 'buttonFinished');

        finishReadButton.innerText = 'Belum Selesai dibaca';
        finishReadButton.setAttribute('id', 'unfinish');

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
        finishReadButton.setAttribute('id', 'finish');

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
    
    if(editTitle) {
        bookTarget.title = editTitle;
    }
    if(editAuthor) {
        bookTarget.author = editAuthor;    
    }
    if(editYear) {
        bookTarget.year = editYear;
    }
    
    const editContainer = document.getElementById('forEditBook');
    editContainer.style.display = 'none';
    
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
        if (bookTarget.length > 0) {
            for (const book of bookTarget) {
                const bookItem = addToHTML(book); 
                if (book.isComplete) {
                    finished.appendChild(bookItem);
                } else {
                    unfinished.appendChild(bookItem);
                }
            }
        } 
        else {
            unfinished.innerHTML = '<h3>Buku tidak ditemukan</h3>';
            finished.innerHTML = '<h3>Buku tidak ditemukan</h3>';
        }
    }    
}

function restoreOriginalBookList() {
    const incompleteList = document.getElementById('incompleteBookList');
    const completeList = document.getElementById('completeBookList');
    
    incompleteList.innerHTML = '';
    completeList.innerHTML = '';
    
    for (const book of datas) {
        const bookItem = addToHTML(book); // Use addToHTML to create the book DOM elements
        if (book.isComplete) {
            completeList.appendChild(bookItem);
        } else {
            incompleteList.appendChild(bookItem);
        }
    }
}
