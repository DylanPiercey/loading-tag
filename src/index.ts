(() => {
  const doc = document;
  const { head, body } = doc;

  // Patch css styles.
  const style = doc.createElement("style");
  style.innerHTML =
    "loading[loaded]{display:none}template{display:none!important}";
  head.insertBefore(style, head.firstChild);

  // Listen for nodes added to the dom.
  let loaders = {};
  let observer = new MutationObserver(mutations => {
    for (const { addedNodes } of mutations) {
      checkAdded(addedNodes);
    }
  });
  observer.observe(doc, {
    childList: true,
    subtree: true
  });

  // Stop listening for nodes, perform one final check for additions.
  doc.addEventListener("DOMContentLoaded", () => {
    observer.disconnect();
    checkAdded(doc.getElementsByTagName("loading"));
    checkAdded(doc.getElementsByTagName("template"));
    loaders = observer = null;
  });

  /**
   * Utility to check for added <loading> or <template> tags in a node list.
   * If a matching <loading> and <template> are found then the loading element is marked as loaded
   * and the template contents added before the loading position in the DOM.
   */
  function checkAdded(addedNodes: NodeList) {
    for (const el of (addedNodes as any) as Node[]) {
      if (el instanceof HTMLElement) {
        if (el.nodeName === "LOADING") {
          const htmlFor = el.getAttribute("for");
          if (htmlFor) {
            loaders[htmlFor] = el;
          }
        } else if (el.nodeName === "TEMPLATE" && el.id) {
          const loader = loaders[el.id];
          if (loader) {
            if (!el.hasAttribute("chunk")) {
              loader.setAttribute("loaded", "");
            }

            loader.parentNode.insertBefore(
              getTemplateContent(el as any),
              loader
            );
            el.parentNode.removeChild(el);
          }
        }
      }
    }
  }

  /**
   * Patch to get the contents of a <template> tag in older browsers.
   */
  function getTemplateContent(el: HTMLTemplateElement) {
    if (el.content) {
      return el.content;
    }

    const fragment = doc.createDocumentFragment();
    while (el.firstChild) {
      fragment.appendChild(el.firstChild);
    }

    return fragment;
  }
})();
