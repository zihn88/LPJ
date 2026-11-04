// GANTI URL DI BAWAH DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const API_URL = 'https://script.google.com/macros/s/AKfycbzoEOmv4rLE9WA-2Hzw_1uf725jf21g1XY13mTNKf8Iw59FEAhb7fpqvyRHslVSDPfKrQ/exec';

let allFolders = [];
let allFiles = [];
let currentFolderId = '';

document.addEventListener('DOMContentLoaded', () => {
    loadFolders();

    // Event listener pencarian lembaga
    document.getElementById('search-folder').addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase();
        const filteredFolders = allFolders.filter(folder => folder.name.toLowerCase().includes(keyword));
        renderFolders(filteredFolders);
    });

    // Event listener pencarian file
    document.getElementById('search-file').addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase();
        const filteredFiles = allFiles.filter(file => file.name.toLowerCase().includes(keyword));
        renderFiles(filteredFiles);
    });
});

async function fetchData(action, folderId = null) {
    let url = `${API_URL}?action=${action}`;
    if (folderId) url += `&folderId=${folderId}`;
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function loadFolders() {
    const folderListEl = document.getElementById('folder-list');
    folderListEl.innerHTML = '<div class="loading">Memuat daftar lembaga...</div>';
    
    const data = await fetchData('getFolders');
    if (data) {
        allFolders = data;
        renderFolders(allFolders);
    } else {
        folderListEl.innerHTML = '<div class="empty-state">Gagal memuat data. Periksa koneksi atau ID Folder.</div>';
    }
}

function renderFolders(folders) {
    const folderListEl = document.getElementById('folder-list');
    folderListEl.innerHTML = '';

    if (folders.length === 0) {
        folderListEl.innerHTML = '<div class="empty-state">Lembaga tidak ditemukan.</div>';
        return;
    }

    folders.forEach(folder => {
        const isAvailable = folder.hasFiles;
        const statusText = isAvailable ? 'Tersedia' : 'Kosong';
        const badgeClass = isAvailable ? 'tersedia' : 'kosong';
        const subtitleText = isAvailable ? 'Dokumen LPJ tersedia' : 'Belum Ada Dokumen';
        const btnClass = isAvailable ? 'btn-outline' : 'btn-outline disabled';
        
        const cardHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title-group">
                        <div class="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div>
                            <div class="card-title">${folder.name}</div>
                            <div class="card-subtitle">${subtitleText}</div>
                        </div>
                    </div>
                    <div class="badge ${badgeClass}">${statusText}</div>
                </div>
                <button class="btn ${btnClass}" onclick="openFolder('${folder.id}', '${folder.name}')" ${!isAvailable ? 'disabled' : ''}>
                    Lihat File LPJ 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        `;
        folderListEl.insertAdjacentHTML('beforeend', cardHTML);
    });
}

async function openFolder(folderId, folderName) {
    currentFolderId = folderId;
    
    // Ganti UI ke mode File View
    document.getElementById('folder-view').classList.remove('active');
    document.getElementById('folder-view').classList.add('hidden');
    document.getElementById('file-view').classList.remove('hidden');
    document.getElementById('file-view').classList.add('active');
    
    document.getElementById('current-folder-name').innerText = folderName;
    document.getElementById('search-file').value = '';
    
    const fileListEl = document.getElementById('file-list');
    fileListEl.innerHTML = '<div class="loading">Memuat dokumen LPJ...</div>';
    
    const data = await fetchData('getFiles', folderId);
    if (data) {
        allFiles = data;
        renderFiles(allFiles);
    } else {
        fileListEl.innerHTML = '<div class="empty-state">Gagal memuat dokumen.</div>';
    }
}

function renderFiles(files) {
    const fileListEl = document.getElementById('file-list');
    fileListEl.innerHTML = '';

    if (files.length === 0) {
        fileListEl.innerHTML = '<div class="empty-state">Belum Ada Dokumen di lembaga ini.</div>';
        return;
    }

    files.forEach(file => {
        const cardHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title-group">
                        <div class="file-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div>
                            <div class="card-title">${file.name}</div>
                            <div class="card-subtitle">${file.ext} · ${file.size}</div>
                        </div>
                    </div>
                </div>
                <!-- a href download target _blank untuk eksekusi tautan langsung -->
                <a href="${file.downloadUrl}" target="_blank" class="btn btn-solid">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download File
                </a>
            </div>
        `;
        fileListEl.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function showFolderView() {
    document.getElementById('file-view').classList.remove('active');
    document.getElementById('file-view').classList.add('hidden');
    document.getElementById('folder-view').classList.remove('hidden');
    document.getElementById('folder-view').classList.add('active');
}