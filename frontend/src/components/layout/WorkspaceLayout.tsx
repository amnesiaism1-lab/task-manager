import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/ToastContainer';
import { ModalContainer } from '../modals/ModalContainer';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0 bg-background/50 custom-scrollbar p-6">
          <div className="max-w-[1600px] mx-auto w-full">
            <ErrorBoundary fallbackTitle="View Rendering Error" fallbackMessage="An error occurred while rendering this view.">
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <ErrorBoundary fallbackTitle="Modal System Error" fallbackMessage="Could not open the requested dialog.">
        <ModalContainer />
      </ErrorBoundary>
      <ToastContainer />
    </div>
  );
};
