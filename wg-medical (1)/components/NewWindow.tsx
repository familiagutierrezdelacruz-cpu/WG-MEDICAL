import React, { useState, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface NewWindowProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

// FIX: Implemented the NewWindow component using a React Portal to render content in a separate browser window, enabling printing functionality.
const NewWindow: React.FC<NewWindowProps> = ({ children, onClose, title = "Print" }) => {
  const [container] = useState(document.createElement('div'));
  const [newWindow, setNewWindow] = useState<Window | null>(null);

  useEffect(() => {
    const win = window.open('', title, 'width=800,height=600');
    if (win) {
      win.document.body.appendChild(container);
      win.document.title = title;
      
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) {
            const newStyleEl = document.createElement('style');
            Array.from(styleSheet.cssRules).forEach(rule => {
              newStyleEl.appendChild(document.createTextNode(rule.cssText));
            });
            win.document.head.appendChild(newStyleEl);
          } else if (styleSheet.href) {
            const newLinkEl = document.createElement('link');
            newLinkEl.rel = 'stylesheet';
            newLinkEl.href = styleSheet.href;
            win.document.head.appendChild(newLinkEl);
          }
        } catch (e) {
            console.warn('Could not copy stylesheet. This can be caused by CORS issues.', e);
        }
      });

      setNewWindow(win);
      win.addEventListener('beforeunload', onClose);
    }

    return () => {
      if (win) {
        win.removeEventListener('beforeunload', onClose);
        if (!win.closed) {
          win.close();
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (newWindow) {
        const timeoutId = setTimeout(() => {
            newWindow.focus();
            newWindow.print();
        }, 500);
        return () => clearTimeout(timeoutId);
    }
  }, [newWindow]);

  return ReactDOM.createPortal(children, container);
};

export default NewWindow;
