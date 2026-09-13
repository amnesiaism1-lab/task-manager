import React from 'react';
import { CreateOrgModal } from './CreateOrgModal';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateIssueModal } from './CreateIssueModal';
import { IssueDetailModal } from './IssueDetailModal';
import { UserProfileModal } from './UserProfileModal';
import { InviteMemberModal } from './InviteMemberModal';
import { JoinOrgModal } from './JoinOrgModal';
import { CommandPalette } from './CommandPalette';
import { Modal } from '../ui/Modal';
import { useUIStore } from '../../stores/useUIStore';

export const ModalContainer: React.FC = () => {
  const { modals, modalData, closeModal } = useUIStore();
  const customModal = modalData['customModal'] || {};

  return (
    <>
      <CreateOrgModal />
      <CreateProjectModal />
      <CreateIssueModal />
      <IssueDetailModal />
      <UserProfileModal />
      <InviteMemberModal />
      <JoinOrgModal />
      <CommandPalette />
      {modals['customModal'] && (
        <Modal
          isOpen={true}
          onClose={() => closeModal('customModal')}
          title={customModal.title || 'Notification'}
          description={customModal.subtitle}
          maxWidth={customModal.size === 'small' ? 'sm' : customModal.size === 'large' ? 'xl' : 'md'}
        >
          <div
            dangerouslySetInnerHTML={{ __html: customModal.contentHtml || '' }}
            className="text-text-primary text-sm space-y-3"
          />
        </Modal>
      )}
    </>
  );
};
