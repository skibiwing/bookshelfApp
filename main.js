/*
{
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
*/ 

document.addEventListener('DOMContentLoaded', ()=>{
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit',(event)=>{
        event.preventDefault();
        addBook();
    })
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
        if(!bookData.isComplete) {
            unfinished.append(books);
        }
        else {
            finished.append(books);
        }
    }
})


const datas = [];
function addBook() {
    const id = generateId()
    const getTitle = document.getElementById('bookFormTitle').value;
    const getAuthor = document.getElementById('bookFormAuthor').value;
    const getYear = document.getElementById('bookFormYear').value;
    const bookObject = generateObject(id, getTitle, getAuthor, getYear, false);

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
    const textTitle = document.createElement('h3')
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
    const editButton = document.createElement('button');
    editButton.innerText = 'Edit buku';
    
    finishReadButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    delButton.setAttribute('data-testid', 'bookItemDeleteButton');
    delButton.addEventListener('click', ()=>{
        eraseBook(bookObject.id);
    })
    editButton.setAttribute('data-testid', 'bookItemEditButton');

    finishedContainer.setAttribute('data-testid', 'bookItem');

    if(isComplete) {
        finishedContainer.classList.add('dataFinished');
        finishedContainer.setAttribute('data-bookid', '123123123');

        buttonContainer.setAttribute('class', 'buttonFinished');

        finishReadButton.innerText = 'Belum selesai dibaca';

        finishReadButton.addEventListener('click', ()=> {
            finishedRead(bookObject.id);
        })

        const theButtons = buttonContainer.append(finishReadButton, delButton, editButton);
        finishedContainer.append(textTitle,textAuthor,textYear,theButtons);

    }
    else {
        finishedContainer.classList.add('dataUninished');
        finishedContainer.setAttribute('data-bookid', '456456456');
                
        buttonContainer.setAttribute('class', 'buttonUninished');

        finishReadButton.innerText = 'Selesai dibaca'

        finishReadButton.addEventListener('click', ()=> {
            unfinishedRead(bookObject.id);
        })

        const theButtons = buttonContainer.append(finishReadButton, delButton, editButton);
        finishedContainer.append(textTitle,textAuthor,textYear,theButtons);
    }
    return finishedContainer
}

/* Unfinished
<div class="dataUnfinished" data-bookid="123123123" data-testid="bookItem">
    <h3 data-testid="bookItemTitle">Judul Buku 1</h3>
    <p data-testid="bookItemAuthor">Penulis: Penulis Buku 1</p>
    <p data-testid="bookItemYear">Tahun: 2030</p>
        <div class="buttonUnfinished">
            <button data-testid="bookItemIsCompleteButton">Selesai dibaca</button>
            <button data-testid="bookItemDeleteButton">Hapus Buku</button>
            <button data-testid="bookItemEditButton">Edit Buku</button>
        </div>
</div>
*/

/* Finished
<div class="dataFinished" data-bookid="456456456" data-testid="bookItem">
  <h3 data-testid="bookItemTitle">Judul Buku 2</h3>
  <p data-testid="bookItemAuthor">Penulis: Penulis Buku 2</p>
  <p data-testid="bookItemYear">Tahun: 2030</p>
  <div class="buttonFinished">
    <button data-testid="bookItemIsCompleteButton">Selesai dibaca</button>
    <button data-testid="bookItemDeleteButton">Hapus Buku</button>
    <button data-testid="bookItemEditButton">Edit Buku</button>
  </div>
</div>

*/

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

const STORAGE_KEY = 'BOOKS'
function ifStorageExist() {
    if(typeof(Storage) === undefined) {
        alert('Browser tidak mendukung local storage')
        return false
    }

    return true
}

function saveData() {
    if(ifStorageExist()) {
        const value = JSON.stringify(datas);
        localStorage.setItem(STORAGE_KEY, value)
    }    
}