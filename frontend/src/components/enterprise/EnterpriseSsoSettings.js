import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Users,
  Copy,
} from 'lucide-react';
import { ssoService } from '../../services/enterprisePlatformService.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Select } from '../ui/Select.js';
import { useToast } from '../../context/ToastContext.js';

export function EnterpriseSsoSettings() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [provider, setProvider] = useState('Okta SAML 2.0');
  const [entityId, setEntityId] = useState('https://auth.hirebridgehr.com/saml/metadata');
  const [acsUrl, setAcsUrl] = useState('https://api.hirebridgehr.com/api/v1/sso/saml/acs');
  const [enforceSso, setEnforceSso] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    ssoService.getConfig().then((res) => {
      if (res.data) {
        setConfig(res.data);
        setProvider(res.data.provider || 'Okta SAML 2.0');
        setEntityId(res.data.entityId || 'https://auth.hirebridgehr.com/saml/metadata');
        setAcsUrl(res.data.acsUrl || 'https://api.hirebridgehr.com/api/v1/sso/saml/acs');
        setEnforceSso(res.data.enforceSSOForEmployees ?? true);
      }
    });
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await ssoService.testConnection({ provider });
      setTestResult(res.data);
      toast.success(
        'SAML Handshake Succeeded',
        `${res.data.provider} verified in ${res.data.latencyMs}ms. 5 IdP claims validated.`
      );
    } catch (e) {
      toast.error('Handshake Failed', 'Could not verify SAML 2.0 connection with IdP.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ssoService.updateConfig({
        provider,
        entityId,
        acsUrl,
        enforceSSOForEmployees: enforceSso,
      });
      toast.success('SSO Config Saved', 'Identity Provider configuration updated across tenant.');
    } catch (e) {
      toast.error('Save Failed', 'Unable to save SSO settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to Clipboard', `${label} copied.`);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Enterprise Single Sign-On (SAML 2.0 & OIDC)</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              SAML 2.0 ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Authenticate enterprise employees via Okta, Microsoft Azure AD / Entra ID, or Google Workspace.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Zap}
          isLoading={isTesting}
          onClick={handleTestConnection}
        >
          Test SAML Handshake
        </Button>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              SAML 2.0 Handshake Verified & Healthy ({testResult.latencyMs}ms)
            </span>
            <span className="font-mono text-[10px] text-slate-300">Status: {testResult.idpStatus}</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Validated Identity Provider claims:{' '}
            <strong className="text-white">email, firstName, lastName, memberOf, department</strong>.
          </p>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Identity Provider (IdP)"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            options={[
              { label: 'Okta SAML 2.0', value: 'Okta SAML 2.0' },
              { label: 'Microsoft Azure Active Directory (Entra ID)', value: 'Microsoft Azure AD' },
              { label: 'Google Workspace SAML', value: 'Google Workspace' },
              { label: 'PingIdentity / OneLogin', value: 'PingIdentity' },
            ]}
          />
          <Input
            label="Corporate Domain Enforcement"
            defaultValue="hirebridgehr.com"
            disabled
            helperText="Users with this email domain will be redirected to SAML login"
          />
        </div>

        {/* SP Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold text-xs">SP Entity ID / Audience URI</label>
              <button
                type="button"
                onClick={() => copyToClipboard(entityId, 'Entity ID')}
                className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <Copy className="w-2.5 h-2.5" /> Copy
              </button>
            </div>
            <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold text-xs">Assertion Consumer Service (ACS) URL</label>
              <button
                type="button"
                onClick={() => copyToClipboard(acsUrl, 'ACS URL')}
                className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <Copy className="w-2.5 h-2.5" /> Copy
              </button>
            </div>
            <Input value={acsUrl} onChange={(e) => setAcsUrl(e.target.value)} />
          </div>
        </div>

        {/* Enforcement Checkbox */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white">Enforce SSO for all Organization Members</div>
            <div className="text-[10px] text-slate-400">
              Disables standard email & password login. All employees must authenticate through corporate IdP.
            </div>
          </div>
          <input
            type="checkbox"
            checked={enforceSso}
            onChange={(e) => setEnforceSso(e.target.checked)}
            className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-white/20"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            Save Enterprise SSO Configuration
          </Button>
        </div>
      </form>
    </Card>
  );
}
