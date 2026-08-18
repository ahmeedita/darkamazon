import { FormEvent, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Search, ShieldCheck, Users, ShoppingCart, ReceiptText, Clock3, MapPin, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Profile = { id: string; username: string; created_at: string; last_active_at?: string; total_time_seconds?: number; last_ip?: string; country?: string; city?: string };
type Cart = { user_id: string; name: string; price: number; details?: string | null; product_type?: string | null };
type Order = { user_id: string; order_id: string; total: number; status: string; created_at: string; payment_currency?: string | null };
type Session = { user_id: string; ip?: string | null; country?: string | null; city?: string | null; started_at: string; last_seen_at: string; duration_seconds?: number };
type DashboardData = { profiles: Profile[]; carts: Cart[]; orders: Order[]; sessions: Session[]; generatedAt: string };

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function Admin() {
  const { user, profile, loading } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  const loadDashboard = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setError('Your session has expired. Please sign in again.'); setBusy(false); return; }
    const { data: result, error: invokeError } = await supabase.functions.invoke('admin-dashboard', {
      body: { passcode }, headers: { Authorization: `Bearer ${token}` },
    });
    if (invokeError || result?.error) setError(result?.error ?? 'Unable to load dashboard');
    else { setData(result as DashboardData); sessionStorage.setItem('admin_verified', '1'); }
    setBusy(false);
  };

  const users = useMemo(() => (data?.profiles ?? []).filter((item) => item.username.toLowerCase().includes(search.toLowerCase())), [data, search]);
  const stats = useMemo(() => {
    const completed = (data?.orders ?? []).filter((order) => order.status === 'completed');
    return {
      users: data?.profiles.length ?? 0,
      active: (data?.profiles ?? []).filter((item) => item.last_active_at && Date.now() - new Date(item.last_active_at).getTime() < 300000).length,
      orders: data?.orders.length ?? 0,
      revenue: completed.reduce((sum, order) => sum + Number(order.total || 0), 0),
    };
  }, [data]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading secure area…</div>;
  if (!user || profile?.username !== 'admin') return <Navigate to="/" replace />;

  if (!data) return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <Card className="glass-strong w-full p-8">
          <div className="mb-8 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary"><ShieldCheck /></div><div><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Restricted</p><h1 className="text-2xl font-semibold">Admin access</h1></div></div>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">Confirm the private passcode to open the operations dashboard.</p>
          <form onSubmit={loadDashboard} className="space-y-4"><Input autoFocus type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Private passcode" aria-label="Private passcode" />{error && <p className="text-sm text-destructive">{error}</p>}<Button disabled={busy || !passcode} className="w-full">{busy ? 'Verifying…' : 'Open dashboard'}</Button></form>
          <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Return to store</Link>
        </Card>
      </div>
    </main>
  );

  const selectedCart = selected ? data.carts.filter((item) => item.user_id === selected.id) : [];
  const selectedOrders = selected ? data.orders.filter((item) => item.user_id === selected.id) : [];
  const selectedSessions = selected ? data.sessions.filter((item) => item.user_id === selected.id).slice(0, 8) : [];

  return <main className="min-h-screen px-4 py-8 md:px-8"><div className="mx-auto max-w-7xl space-y-8">
    <header className="flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-end md:justify-between"><div><p className="text-xs uppercase tracking-[0.24em] text-primary">torbuy / operations</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Admin dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Live account, cart, order, and session intelligence.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => { setData(null); setPasscode(''); sessionStorage.removeItem('admin_verified'); }}><LogOut className="h-4 w-4" /> Lock</Button><Link to="/"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Store</Button></Link></div></header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[Users, 'Users', stats.users], [Clock3, 'Active now', stats.active], [ReceiptText, 'Orders', stats.orders], [ShoppingCart, 'Completed revenue', `$${stats.revenue.toFixed(2)}`]].map(([Icon, label, value]) => <Card key={label as string} className="glass p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label as string}</p><Icon className="h-4 w-4 text-primary" /></div><p className="mt-4 text-3xl font-semibold">{value as string | number}</p></Card>)}</section>
    <Card className="glass overflow-hidden"><div className="flex flex-col gap-4 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold">User accounts</h2><p className="text-sm text-muted-foreground">Select an account for its private activity trail.</p></div><div className="relative w-full md:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search usernames" className="pl-9" /></div></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Time</th><th className="px-5 py-4">Cart</th><th className="px-5 py-4">Last active</th></tr></thead><tbody>{users.map((item) => { const cart = data.carts.filter((cartItem) => cartItem.user_id === item.id); return <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer border-t border-border/50 transition-colors hover:bg-primary/5"><td className="px-5 py-4 font-medium">{item.username}{item.username === 'admin' && <Badge className="ml-2">owner</Badge>}</td><td className="px-5 py-4 text-muted-foreground">{item.city || item.country ? `${item.city ?? ''}${item.city && item.country ? ', ' : ''}${item.country ?? ''}` : 'Unknown'}</td><td className="px-5 py-4 text-muted-foreground">{formatDuration(item.total_time_seconds)}</td><td className="px-5 py-4">{cart.length} <span className="text-muted-foreground">/ ${cart.reduce((sum, cartItem) => sum + Number(cartItem.price || 0), 0).toFixed(2)}</span></td><td className="px-5 py-4 text-muted-foreground">{item.last_active_at ? new Date(item.last_active_at).toLocaleString() : '—'}</td></tr>})}</tbody></table></div></Card>
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={() => setSelected(null)}><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-primary">Account detail</p><h2 className="mt-2 text-3xl font-semibold">{selected.username}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.last_ip || 'No IP recorded'}</p></div><Button variant="ghost" onClick={() => setSelected(null)} aria-label="Close detail">Close</Button></div><div className="mt-8 space-y-6"><section><h3 className="mb-3 font-medium">Cart ({selectedCart.length})</h3>{selectedCart.length ? selectedCart.map((item, index) => <div key={`${item.name}-${index}`} className="flex justify-between border-b border-border/50 py-3 text-sm"><span>{item.name}<span className="block text-muted-foreground">{item.details || item.product_type || 'Item'}</span></span><span className="text-primary">${Number(item.price).toFixed(2)}</span></div>) : <p className="text-sm text-muted-foreground">Cart is empty.</p>}</section><section><h3 className="mb-3 font-medium">Orders ({selectedOrders.length})</h3>{selectedOrders.length ? selectedOrders.map((order) => <div key={order.order_id} className="flex items-center justify-between border-b border-border/50 py-3 text-sm"><span><span className="block font-mono text-xs">{order.order_id.slice(0, 16)}</span><span className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</span></span><span className="text-right"><Badge variant="outline">{order.status}</Badge><span className="mt-1 block text-primary">${Number(order.total).toFixed(2)}</span></span></div>) : <p className="text-sm text-muted-foreground">No orders.</p>}</section><section><h3 className="mb-3 flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-primary" /> Recent sessions</h3>{selectedSessions.length ? selectedSessions.map((session, index) => <div key={`${session.started_at}-${index}`} className="border-b border-border/50 py-3 text-sm"><div className="flex justify-between"><span>{session.city || session.country || 'Unknown location'}</span><span>{formatDuration(session.duration_seconds)}</span></div><p className="mt-1 text-xs text-muted-foreground">{session.ip || 'No IP'} · {new Date(session.started_at).toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">No sessions recorded.</p>}</section></div></aside></div>}
  </div></main>;
}
