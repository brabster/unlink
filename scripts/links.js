const storageKey = 'allowedDomainsAndSubdomains';

const getAllowedDomainsAndSubdomains = () => chrome.storage.local.get(storageKey)
  .then((allowed) => allowed && allowed[storageKey] ? Object.keys(allowed[storageKey]): []);

const extLinkOnclickEventHandler = (e) => {
  e.preventDefault();
}

const isAllowedDomainOrSubdomain = (allowedDomainsAndSubdomains, link) =>
  allowedDomainsAndSubdomains.some((allowed) => link.host && link.host.endsWith(allowed))

const isDifferentOriginLink = (link) => link.host && link.host != window.location.host

const hostCheckAndBlock = (allowedDomainsAndSubdomains) => {
  return (link) => {
    if (isDifferentOriginLink(link) && !isAllowedDomainOrSubdomain(allowedDomainsAndSubdomains, link)) {
      link.style.border = '2px solid red';
      link.style.background = '#ffcccc';
      link.title = `external: ${link.host}`;
      link.addEventListener('click', extLinkOnclickEventHandler);
    }
  }
};

getAllowedDomainsAndSubdomains()
  .then((allowed) => hostCheckAndBlock(allowed))
  .then((configuredHostCheckAndBlock) => {
    const basicLinks = document.querySelectorAll('a');
    [...basicLinks].forEach(configuredHostCheckAndBlock);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const links = node.querySelectorAll('a');
              links.forEach(configuredHostCheckAndBlock);
              if (node.nodeName === 'A') {
                configuredHostCheckAndBlock(node)
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

  })

