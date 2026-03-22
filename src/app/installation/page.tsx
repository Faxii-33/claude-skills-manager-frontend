'use client';

import { useState } from 'react';
import { Copy, Check, Monitor, Terminal } from 'lucide-react';

export default function InstallationPage() {
  const [copiedDesktop, setCopiedDesktop] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBrowser, setCopiedBrowser] = useState(false);

  const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
    ? `${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/mcp`
    : 'https://claude-skills-manager-production.up.railway.app/mcp';

  const desktopConfig = JSON.stringify({
    mcpServers: {
      'team-skills': {
        type: 'streamablehttp',
        url: mcpUrl,
      },
    },
  }, null, 2);

  const codeCommand = `claude mcp add team-skills --transport streamable-http "${mcpUrl}"`;

  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-xs text-slate-500 tracking-widest mb-1">Workspace <span className="text-slate-600">/</span> Installation Guide</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Installation Guide</h1>
        <p className="text-sm text-slate-400 mt-2">Connect to your team skills MCP server using one of the methods below.</p>
      </div>

      {/* Claude Desktop */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center">
            <Monitor size={18} className="text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Claude Desktop</h3>
            <p className="text-xs text-slate-500">macOS & Windows app</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-sm text-slate-400">
            <p><span className="text-slate-300 font-medium">1.</span> Open Claude Desktop</p>
            <p><span className="text-slate-300 font-medium">2.</span> Go to <span className="text-slate-300">Settings → Developer → Edit Config</span></p>
            <p><span className="text-slate-300 font-medium">3.</span> Paste the config below and save</p>
            <p><span className="text-slate-300 font-medium">4.</span> Restart Claude Desktop</p>
          </div>

          <div className="relative">
            <pre className="bg-surface-950 border border-surface-700/50 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">
{desktopConfig}
            </pre>
            <button
              onClick={() => handleCopy(desktopConfig, setCopiedDesktop)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              {copiedDesktop ? <Check size={12} /> : <Copy size={12} />}
              {copiedDesktop ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Claude Code (CLI) */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-accent-green/20 flex items-center justify-center">
            <Terminal size={18} className="text-accent-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Claude Code (CLI)</h3>
            <p className="text-xs text-slate-500">Terminal-based Claude</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-sm text-slate-400">
            <p>Run the following command in your terminal:</p>
          </div>

          <div className="relative">
            <pre className="bg-surface-950 border border-surface-700/50 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">
{codeCommand}
            </pre>
            <button
              onClick={() => handleCopy(codeCommand, setCopiedCode)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              {copiedCode ? <Check size={12} /> : <Copy size={12} />}
              {copiedCode ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            This registers the MCP server globally. To add it to a specific project only, run the command from within that project directory and add <span className="text-slate-400 font-mono">--scope project</span>.
          </p>
        </div>
      </div>

      {/* Claude in Browser */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-accent-amber/20 flex items-center justify-center">
            <Monitor size={18} className="text-accent-amber" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Claude in Browser (claude.ai)</h3>
            <p className="text-xs text-slate-500">Web-based Claude</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-sm text-slate-400">
            <p><span className="text-slate-300 font-medium">1.</span> Go to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">claude.ai</a></p>
            <p><span className="text-slate-300 font-medium">2.</span> Click on your profile icon → <span className="text-slate-300">Settings → Integrations</span></p>
            <p><span className="text-slate-300 font-medium">3.</span> Click <span className="text-slate-300">Add More</span> and select <span className="text-slate-300">Custom Integration</span></p>
            <p><span className="text-slate-300 font-medium">4.</span> Paste the server URL below and give it a name</p>
            <p><span className="text-slate-300 font-medium">5.</span> Save and start a new conversation</p>
          </div>

          <div className="relative">
            <pre className="bg-surface-950 border border-surface-700/50 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">
{mcpUrl}
            </pre>
            <button
              onClick={() => handleCopy(mcpUrl, setCopiedBrowser)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              {copiedBrowser ? <Check size={12} /> : <Copy size={12} />}
              {copiedBrowser ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="bg-surface-900 border border-brand-500/20 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Verify Connection</h3>
        <p className="text-sm text-slate-400 mb-3">
          Once connected, you should see <span className="text-slate-300 font-mono text-xs">team-skills</span> listed as an available MCP server. Try asking Claude:
        </p>
        <div className="bg-surface-950 border border-surface-700/50 rounded-lg p-4 text-sm text-slate-300 italic">
          &ldquo;What skills are available?&rdquo;
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Claude will use the MCP tools to list all skills your team has created.
        </p>
      </div>
    </div>
  );
}
