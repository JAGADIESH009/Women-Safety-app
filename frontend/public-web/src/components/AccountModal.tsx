import React from 'react';
import { 
  X, 
  LogOut, 
  ShieldCheck, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    loading, 
    authError, 
    signInWithGoogle, 
    signOut, 
    isFirebaseAvailable 
  } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-brand" />
            <h3 className="text-lg font-bold">
              {user ? 'SafeHer Companion Profile' : 'Sign In to SafeHer'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="icon-btn" 
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {!isFirebaseAvailable ? (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <div>
                <strong>Firebase Configuration Required</strong>
                <p className="text-xs mt-1">
                  Firebase web credentials are not configured in the environment. Please check <code>.env</code>.
                </p>
              </div>
            </div>
          ) : user ? (
            /* Signed-in View */
            <div className="signed-in-view">
              <div className="user-profile-card">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="modal-avatar-img" />
                ) : (
                  <div className="modal-avatar-placeholder">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="user-profile-details">
                  <h4 className="font-bold text-base">{user.displayName || 'SafeHer User'}</h4>
                  <p className="text-xs text-muted font-mono">{user.email}</p>
                  <div className="mt-1">
                    <span className="badge badge-success text-xs">Standard Member</span>
                  </div>
                </div>
              </div>

              <div className="companion-sync-card">
                <h5 className="font-semibold text-xs uppercase tracking-wider text-muted mb-2">
                  Mobile Application Sync
                </h5>
                <div className="space-y-2 text-xs text-secondary leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald flex-shrink-0 mt-0.5" />
                    <span>Using the same Google Account on the Android APK syncs your profile securely.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock size={15} className="text-brand flex-shrink-0 mt-0.5" />
                    <span>Your emergency contacts and reports are strictly partitioned to your identity.</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions-row mt-6">
                <button 
                  onClick={() => {
                    signOut();
                  }}
                  className="btn btn-outline btn-sm w-full"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not Signed-in View */
            <div className="sign-in-prompt-view">
              <div className="text-center mb-6">
                <div className="sign-in-icon-circle mx-auto mb-3">
                  <User size={24} className="text-brand" />
                </div>
                <h4 className="font-bold text-lg mb-1">Welcome to SafeHer</h4>
                <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                  Sign in with Google to synchronize your SafeHer companion identity with the Android application.
                </p>
              </div>

              {authError && (
                <div className="alert-box alert-error mb-4">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <div className="text-xs">
                    <strong>Authentication Note:</strong>
                    <p className="mt-1">{authError}</p>
                    {authError.includes('Authorized domains') && (
                      <p className="mt-2 text-muted">
                        To resolve: Open Firebase Console → Authentication → Settings → Authorized domains and add this host.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={signInWithGoogle}
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <span>Connecting to Google...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="security-notice-box mt-6">
                <Lock size={13} className="text-muted flex-shrink-0" />
                <span className="text-xs text-muted">
                  SafeHer uses official Firebase Authentication. Passwords and credentials are never stored on this website.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
