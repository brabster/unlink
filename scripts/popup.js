const storageKey = 'allowedDomainsAndSubdomains';

const initStorageStructure = {[storageKey]: {}};

const getAllowedDomainsFromStorage = () => chrome.storage.local.get(storageKey)
        .then((allowed) => allowed && allowed[storageKey] ? allowed : initStorageStructure)

const refreshDisplay = () => {
    getAllowedDomainsFromStorage()
        .then((allowed) => {
            domains = allowed[storageKey];
            document.getElementById('allowed').innerHTML =
                '<ul style="list-style-type: none;padding:0px;margin:0px;">' +
                Object.keys(domains).sort().map((domain) =>
                    `<li data-allowed-domain="${domain}"><button class="remove-domain-button">X</button> ${domain}</li>`
                ).join('') +
                '</ul>';
        });
}

const populate = () => {

    refreshDisplay();

    document.getElementById('clear').addEventListener('click', () => {
        chrome.storage.local.set(initStorageStructure)
            .then(refreshDisplay);
    })

    document.getElementById('allowed').addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-domain-button')) {
            const domainToRemove = event.target.parentNode.dataset.allowedDomain;
            console.dir(event.target.parentNode.dataset.allowedDomain);
            chrome.storage.local.get(storageKey)
                .then((allowed) => {
                    delete allowed[storageKey][domainToRemove];
                    return allowed;
                })
                .then((updatedAllowed) => chrome.storage.local.set(updatedAllowed))
                .then(refreshDisplay);            
        }
    });

    document.getElementById('addDomainButton').addEventListener('click', () => {
        const urlOrDomain = document.getElementById('urlOrDomain').value;
        let host;
        const url = urlOrDomain.startsWith('http') ? urlOrDomain : `http://${urlOrDomain}`;
        try {
            host = new URL(url).hostname;
        } catch (ex) {
            alert(`Invalid URL "${urlOrDomain}"`)
            return;
        }
        getAllowedDomainsFromStorage()
            .then((allowed) => {
                allowed[storageKey][host] = true
                return allowed;
            })
            .then((updatedAllowed) => {
                chrome.storage.local.set(updatedAllowed);
                document.getElementById('urlOrDomain').value = '';
            })
            .then(refreshDisplay);
    });

    document.getElementById('urlOrDomain').addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.key === 'Enter') {
            document.getElementById("addDomainButton").click();
        }
    });

}

document.addEventListener('DOMContentLoaded', populate);