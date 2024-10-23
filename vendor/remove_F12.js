(function() {
    let devToolsOpen = false;

    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (
            !(heightThreshold && widthThreshold) &&
            ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
        ) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                // Attempt to close the tab
                closeTab();
            }
        } else {
            devToolsOpen = false;
        }
    }

    function closeTab() {
        // Attempt to close the current tab
        //window.close();
        
        // If window.close() doesn't work, try to replace the content
        //document.body.innerHTML = 'This tab has been closed due to unauthorized access. <br>If you have turned off the developer mode, please refresh the page.';
        
        // You could also redirect to another page
        // window.location.href = 'https://example.com';
    }

    // Check for DevTools every 1000ms
    setInterval(detectDevTools, 10);

    // Attempt to prevent right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);

    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });
    
    document.querySelectorAll('.disabled').forEach(element => {
        element.style.pointerEvents = 'none';
    });

    // Attempt to prevent common keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent F12
        if (e.key === 'F12') {
            e.preventDefault();
            closeTab();
            return false;
        }
        
        // Prevent Ctrl+Shift+I, Cmd+Option+I
        if ((e.ctrlKey && e.shiftKey && e.key === 'I') || (e.metaKey && e.altKey && e.key === 'I')) {
            e.preventDefault();
            closeTab();
            return false;
        }
        
        // Prevent Ctrl+Shift+J, Cmd+Option+J
        if ((e.ctrlKey && e.shiftKey && e.key === 'J') || (e.metaKey && e.altKey && e.key === 'J')) {
            e.preventDefault();
            closeTab();
            return false;
        }
        
        // Prevent Ctrl+Shift+C, Cmd+Option+C
        if ((e.ctrlKey && e.shiftKey && e.key === 'C') || (e.metaKey && e.altKey && e.key === 'C')) {
            e.preventDefault();
            closeTab();
            return false;
        }
    }, false);
})();
