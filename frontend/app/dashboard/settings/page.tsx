export default function SettingsPage() {
  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 mb-4">
        <h2 className="font-medium mb-3">WhatsApp Automation</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">Enable AI auto-reply</span>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </label>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 mb-4">
        <h2 className="font-medium mb-3">WhatsApp Phone Number</h2>
        <input
          type="text"
          placeholder="Phone Number ID from Meta App dashboard"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <h2 className="font-medium mb-3">Reply Tone</h2>
        <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm">
          <option>Friendly & casual</option>
          <option>Professional</option>
          <option>Warm & concise</option>
        </select>
      </div>
    </div>
  );
}
