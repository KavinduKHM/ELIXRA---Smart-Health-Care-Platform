// src/context/CustomAlertContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomAlertContext = createContext(null);

export const CustomAlertProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    title: 'Elixra Health',
    message: '',
    resolve: null,
  });

  useEffect(() => {
    // Override window.alert (returns undefined, safe to run asynchronously)
    const nativeAlert = window.alert;
    window.alert = (message) => {
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Elixra Health',
        message: message === undefined ? '' : String(message),
        resolve: null
      });
    };

    // Override window.confirm (returns Promise, requires async/await at call site)
    const nativeConfirm = window.confirm;
    window.confirm = (message) => {
      return new Promise((resolve) => {
        setModal({
          isOpen: true,
          type: 'confirm',
          title: 'Confirmation',
          message: message === undefined ? '' : String(message),
          resolve: resolve
        });
      });
    };

    return () => {
      window.alert = nativeAlert;
      window.confirm = nativeConfirm;
    };
  }, []);

  const handleAction = (result) => {
    const { resolve } = modal;
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolve) {
      resolve(result);
    }
  };

  return (
    <CustomAlertContext.Provider
      value={{
        showAlert: (msg, title = 'Elixra Health') => {
          setModal({ isOpen: true, type: 'alert', title, message: String(msg), resolve: null });
        },
        showConfirm: (msg, title = 'Confirmation') => {
          return new Promise((resolve) => {
            setModal({ isOpen: true, type: 'confirm', title, message: String(msg), resolve });
          });
        }
      }}
    >
      {children}
      {modal.isOpen && (
        <div className="custom-modal-overlay" onClick={() => modal.type === 'alert' && handleAction(true)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <div className={`custom-modal-header-icon ${modal.type}`}>
                {modal.type === 'confirm' ? '❓' : '🔔'}
              </div>
              <h3>{modal.title}</h3>
            </div>
            <div className="custom-modal-body">{modal.message}</div>
            <div className="custom-modal-footer">
              {modal.type === 'confirm' ? (
                <>
                  <button type="button" className="custom-modal-btn cancel" onClick={() => handleAction(false)}>
                    Cancel
                  </button>
                  <button type="button" className="custom-modal-btn confirm" onClick={() => handleAction(true)}>
                    Confirm
                  </button>
                </>
              ) : (
                <button type="button" className="custom-modal-btn ok" onClick={() => handleAction(true)}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </CustomAlertContext.Provider>
  );
};

export const useCustomAlerts = () => useContext(CustomAlertContext);
