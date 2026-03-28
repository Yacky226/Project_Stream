import { Bolt, ShieldCheck } from 'lucide-react';

interface AuthAsideProps {
  currentYear: number;
  onNavigate: (path: string) => void;
}

export function AuthAside({ currentYear, onNavigate }: AuthAsideProps) {
  return (
    <aside className="authx-aside">
      <div className="authx-aside-overlay"></div>

      <div className="authx-aside-brand">
        <span className="authx-brand-icon-square" aria-hidden="true"></span>
        <span className="authx-brand-name">Platform</span>
      </div>

      <div className="authx-aside-content">
        <h1>Elevate your professional workflow.</h1>
        <p>
          Join a collaborative learning and streaming platform trusted by teams and
          institutions worldwide.
        </p>

        <div className="authx-benefits-list">
          <div className="authx-benefit-item">
            <div className="authx-benefit-icon">
              <Bolt size={18} />
            </div>
            <div>
              <h3>Real-time analytics</h3>
              <p>Track every metric as it happens with zero latency.</p>
            </div>
          </div>

          <div className="authx-benefit-item">
            <div className="authx-benefit-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3>Enterprise security</h3>
              <p>Your data is protected by strong security controls.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="authx-aside-footer">
        <span>Copyright {currentYear} Platform Inc.</span>
        <div className="authx-aside-links">
          <button onClick={() => onNavigate('/privacy')} type="button">Privacy</button>
          <button onClick={() => onNavigate('/terms')} type="button">Terms</button>
        </div>
      </div>
    </aside>
  );
}
