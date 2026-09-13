import React from 'react';
import { CreateOrgModal } from './CreateOrgModal';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateIssueModal } from './CreateIssueModal';
import { IssueDetailModal } from './IssueDetailModal';
import { UserProfileModal } from './UserProfileModal';
import { InviteMemberModal } from './InviteMemberModal';
import { JoinOrgModal } from './JoinOrgModal';

export const ModalContainer: React.FC = () => {
  return (
    <>
      <CreateOrgModal />
      <CreateProjectModal />
      <CreateIssueModal />
      <IssueDetailModal />
      <UserProfileModal />
      <InviteMemberModal />
      <JoinOrgModal />
    </>
  );
};
