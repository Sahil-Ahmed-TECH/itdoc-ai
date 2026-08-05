import type { TicketInput } from "./generate-docs";

/**
 * Extensible issue-template registry.
 *
 * Add a new template by appending an entry to `issueTemplates` — the dropdown,
 * lookup and apply logic all derive from this array, so no UI changes are needed.
 */
export type TemplateFields = Pick<
  TicketInput,
  "issueSummary" | "symptoms" | "steps" | "commands" | "resolution" | "notes"
>;

export interface IssueTemplate {
  id: string;
  label: string;
  fields: TemplateFields;
}

const blankFields: TemplateFields = {
  issueSummary: "",
  symptoms: "",
  steps: "",
  commands: "",
  resolution: "",
  notes: "",
};

export const blankTemplateId = "blank";

export const issueTemplates: IssueTemplate[] = [
  { id: blankTemplateId, label: "Blank Ticket", fields: blankFields },
  {
    id: "outlook",
    label: "Outlook",
    fields: {
      issueSummary: "Outlook repeatedly prompts for credentials and fails to sync the mailbox.",
      symptoms:
        "Continuous credential prompts on launch\nSend/receive error 0x8004010F\nMailbox shows 'Disconnected' in the status bar\nOWA access works without issue",
      steps:
        "Confirmed the account is enabled and not locked in Active Directory\nVerified mailbox access via Outlook on the web\nCleared cached credentials from Windows Credential Manager\nRan Outlook in safe mode to rule out add-ins\nRecreated the Outlook profile and allowed autodiscover to complete",
      commands:
        "outlook.exe /safe\ncmdkey /list\nTest-OutlookConnectivity -Protocol Http\nGet-Mailbox -Identity user@contoso.com | Format-List",
      resolution:
        "Removed the stale Microsoft Office credential entry and recreated the Outlook profile. Autodiscover resolved correctly and the mailbox completed a full sync.",
      notes:
        "Stale credentials followed a recent password reset. Advise users to sign out of Office apps before password changes.",
    },
  },
  {
    id: "m365",
    label: "Microsoft 365",
    fields: {
      issueSummary: "User unable to sign in to Microsoft 365 apps; licence appears unassigned.",
      symptoms:
        "'Your account does not have a valid licence' on app launch\nOffice apps drop into reduced functionality mode\nSharePoint and OneDrive links fail to open",
      steps:
        "Reviewed the user's licence assignment in the Microsoft 365 admin centre\nChecked service health for active incidents\nSigned the user out of all Microsoft 365 sessions\nReassigned the Microsoft 365 E3 licence and forced a directory sync\nRe-activated Office on the endpoint",
      commands:
        "Connect-MgGraph -Scopes 'User.ReadWrite.All'\nGet-MgUserLicenseDetail -UserId user@contoso.com\nRevoke-MgUserSignInSession -UserId user@contoso.com\ncscript ospp.vbs /dstatus",
      resolution:
        "Reassigned the Microsoft 365 E3 licence, revoked existing sessions and re-activated Office. All applications returned to full functionality after sign-in.",
      notes:
        "Licence was released by an automated group membership change. Review the dynamic group rule that governs licence assignment.",
    },
  },
  {
    id: "entra",
    label: "Azure / Entra ID",
    fields: {
      issueSummary: "Conditional Access policy blocking sign-in from a compliant corporate device.",
      symptoms:
        "Error AADSTS53003: access blocked by Conditional Access policy\nSign-in succeeds on the corporate network only\nDevice shows as registered but not compliant",
      steps:
        "Reviewed the Entra ID sign-in logs for the failed correlation ID\nIdentified the Conditional Access policy applied to the sign-in\nChecked device compliance state in Intune\nTriggered a device sync and re-evaluated compliance\nUsed the What If tool to confirm expected policy behaviour",
      commands:
        "Connect-MgGraph -Scopes 'Policy.Read.All','AuditLog.Read.All'\nGet-MgAuditLogSignIn -Filter \"userPrincipalName eq 'user@contoso.com'\" -Top 5\ndsregcmd /status",
      resolution:
        "Device compliance had lapsed due to a pending encryption check. After remediation and a forced sync the device returned to compliant and sign-in succeeded under the existing policy.",
      notes:
        "No policy exclusions were required. Monitor for further compliance drift across the same device group.",
    },
  },
  {
    id: "intune",
    label: "Intune",
    fields: {
      issueSummary: "Intune-managed device not receiving assigned configuration and app policies.",
      symptoms:
        "Assigned applications never install\nCompany Portal shows 'Waiting for install status'\nLast device check-in is several days old",
      steps:
        "Confirmed the device object exists and is Entra-joined\nVerified group membership targeting for the assignments\nReviewed the MDM diagnostic logs on the endpoint\nForced an MDM sync from Settings and the Company Portal\nRestarted the Microsoft Intune Management Extension service",
      commands:
        "dsregcmd /status\nRestart-Service IntuneManagementExtension\nGet-ScheduledTask -TaskName PushLaunch | Start-ScheduledTask\nmdmdiagnosticstool.exe -area DeviceEnrollment -cab C:\\Temp\\mdm.cab",
      resolution:
        "The Intune Management Extension service had stalled. Restarting the service and forcing a sync delivered all pending configuration and application assignments.",
      notes:
        "Device had been offline for an extended period. Confirm check-in cadence returns to normal over the next 24 hours.",
    },
  },
  {
    id: "bitlocker",
    label: "BitLocker Recovery",
    fields: {
      issueSummary: "Laptop booting to the BitLocker recovery screen and requesting a recovery key.",
      symptoms:
        "Blue BitLocker recovery screen on startup\nRecovery key ID displayed on screen\nDevice unusable until the key is entered",
      steps:
        "Verified the user's identity before releasing any recovery material\nMatched the on-screen key ID to the escrowed key in Entra ID\nProvided the recovery key and confirmed successful boot\nChecked recent firmware and Secure Boot changes\nSuspended and resumed protection to reseal the TPM measurements",
      commands:
        "manage-bde -status C:\nmanage-bde -protectors -get C:\nSuspend-BitLocker -MountPoint 'C:' -RebootCount 1\nGet-MgInformationProtectionBitlockerRecoveryKey",
      resolution:
        "Recovery triggered by a firmware update that changed TPM measurements. Released the escrowed key, then suspended and resumed protection so the new measurements were sealed.",
      notes:
        "Recovery key remains escrowed in Entra ID. Suspend BitLocker before future firmware updates on this model.",
    },
  },
  {
    id: "mfa",
    label: "MFA Issue",
    fields: {
      issueSummary: "User unable to complete multi-factor authentication after replacing their phone.",
      symptoms:
        "No approval notification received in Microsoft Authenticator\nVerification codes rejected as invalid\nSign-in fails at the MFA prompt on all applications",
      steps:
        "Verified the user's identity following the service desk verification standard\nReviewed MFA method registration in Entra ID\nConfirmed device time synchronisation on the new handset\nRemoved the stale Authenticator registration\nIssued a temporary access pass and guided re-registration",
      commands:
        "Connect-MgGraph -Scopes 'UserAuthenticationMethod.ReadWrite.All'\nGet-MgUserAuthenticationMethod -UserId user@contoso.com\nw32tm /resync",
      resolution:
        "Removed the obsolete Authenticator registration and re-enrolled MFA on the new device using a temporary access pass. Sign-in and push approval verified successfully.",
      notes:
        "Remind users to transfer or re-register Authenticator before disposing of an old handset.",
    },
  },
  {
    id: "password-reset",
    label: "Password Reset",
    fields: {
      issueSummary: "Account locked out and password reset required after repeated failed sign-ins.",
      symptoms:
        "Repeated 'account locked' messages at sign-in\nLockouts recur shortly after unlock\nMobile mail client prompting for credentials",
      steps:
        "Verified the user's identity per service desk policy\nIdentified the lockout source from the domain controller security logs\nUnlocked the account and reset the password\nRemoved cached credentials from the offending mobile device\nConfirmed successful sign-in across email and core applications",
      commands:
        "Search-ADAccount -LockedOut | Select-Object Name,LastLogonDate\nUnlock-ADAccount -Identity jmiller\nSet-ADAccountPassword -Identity jmiller -Reset\nklist purge",
      resolution:
        "Lockouts were caused by an old cached password on the user's mobile mail profile. Reset the password, cleared the cached credentials and confirmed no further lockouts.",
      notes: "Monitor lockout events for 48 hours to confirm no other stale sessions remain.",
    },
  },
  {
    id: "onboarding",
    label: "New User Onboarding",
    fields: {
      issueSummary: "Provision accounts, licences and equipment for a new starter.",
      symptoms:
        "New starter has no account or mailbox\nNo access to shared drives or line-of-business applications\nHardware not yet issued or enrolled",
      steps:
        "Created the user account and populated HR attributes\nAdded the user to role-based access groups\nAssigned the Microsoft 365 licence and provisioned the mailbox\nEnrolled the laptop in Intune and applied the standard configuration\nCompleted MFA registration and a first-day induction walkthrough",
      commands:
        "New-ADUser -Name 'Joel Miller' -SamAccountName jmiller -Enabled $true\nAdd-ADGroupMember -Identity 'GRP-Finance-Users' -Members jmiller\nSet-MgUserLicense -UserId jmiller@contoso.com",
      resolution:
        "All accounts, licences, group memberships and hardware were provisioned and verified. The user signed in successfully and confirmed access to required systems.",
      notes:
        "Asset tag and serial number recorded in the CMDB. Schedule a check-in at the end of the first week.",
    },
  },
  {
    id: "printer",
    label: "Printer",
    fields: {
      issueSummary: "Users unable to print to the shared network printer; jobs remain queued.",
      symptoms:
        "Jobs sit in the queue and never complete\nPrinter shows offline in Devices and Printers\nOther users on the same queue are also affected",
      steps:
        "Confirmed the printer is powered on, online and reachable on the network\nChecked the print queue on the print server\nCleared stuck jobs and restarted the Print Spooler service\nReinstalled the printer driver on the affected workstation\nSubmitted a test page to confirm output",
      commands:
        "ping 10.20.4.51\nGet-Printer | Where-Object Name -like '*FIN*'\nRestart-Service Spooler\nGet-PrintJob -PrinterName 'PRN-FIN-02'",
      resolution:
        "A corrupt job had stalled the queue on the print server. Cleared the queue, restarted the spooler and confirmed successful printing from affected workstations.",
      notes:
        "Recurring stalls on this queue may warrant a driver upgrade to the latest universal print driver.",
    },
  },
  {
    id: "vpn",
    label: "VPN",
    fields: {
      issueSummary: "Remote user cannot establish a VPN connection to the corporate network.",
      symptoms:
        "Connection attempt fails during authentication\nInternal resources unreachable while disconnected\nHome internet connectivity confirmed working",
      steps:
        "Confirmed the client version and profile configuration\nVerified account status and VPN group membership\nReviewed the VPN gateway authentication logs\nReset the network adapters and flushed the DNS cache\nReconnected and validated access to internal resources",
      commands:
        "ipconfig /flushdns\nnetsh int ip reset\nTest-NetConnection vpn.contoso.com -Port 443\nGet-VpnConnection",
      resolution:
        "Client profile was pointing at a decommissioned gateway. Updated the VPN profile to the current endpoint; connection established and internal resources verified.",
      notes:
        "Check for other users still on the legacy profile and push the updated configuration where required.",
    },
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    fields: {
      issueSummary: "Laptop repeatedly disconnecting from the corporate wireless network.",
      symptoms:
        "Wi-Fi drops every few minutes\nLimited connectivity warnings in the network tray\nWired connection remains stable",
      steps:
        "Confirmed the issue occurs across multiple access points\nChecked the wireless adapter driver version and updated it\nRemoved and re-added the corporate wireless profile\nDisabled adapter power saving on the wireless NIC\nMonitored the connection for stability after the change",
      commands:
        "netsh wlan show interfaces\nnetsh wlan show profiles\nnetsh wlan delete profile name='CONTOSO-CORP'\nnetsh wlan show wlanreport",
      resolution:
        "Outdated wireless driver combined with adapter power saving caused the drops. Updated the driver, disabled power management and recreated the profile; connection has remained stable since.",
      notes:
        "Consider adding this driver version to the standard image if similar reports continue on the same hardware model.",
    },
  },
  {
    id: "software-install",
    label: "Software Installation",
    fields: {
      issueSummary: "Requested application fails to install on the user's managed workstation.",
      symptoms:
        "Installation fails with error code 1603\nApplication missing from the Company Portal after retry\nUser blocked from completing business tasks",
      steps:
        "Confirmed the software request was approved and correctly licensed\nChecked device group targeting for the application assignment\nReviewed the installation logs on the endpoint\nRemoved a partial previous installation\nRetried the deployment and verified the application launches",
      commands:
        "Get-AppxPackage -Name '*AppName*'\nmsiexec /i app.msi /qn /l*v C:\\Temp\\install.log\nRestart-Service IntuneManagementExtension",
      resolution:
        "A partially removed earlier version blocked the installer. Cleaned up the remnants and re-ran the deployment, which completed successfully and the application launched without error.",
      notes:
        "Add an uninstall step to the deployment for devices upgrading from the legacy version.",
    },
  },
];

export const getIssueTemplate = (id: string) => issueTemplates.find((t) => t.id === id);
