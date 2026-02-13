let apiBase: string | null = null;
let apiToken: string | null = null;

export function setApiEndpoint(endpoint: string) {
	apiBase = endpoint.replace(/\/+$/, '');
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('aivena-api-endpoint', apiBase);
	}
}

export function getApiEndpoint(): string | null {
	if (apiBase) return apiBase;
	if (typeof localStorage !== 'undefined') {
		apiBase = localStorage.getItem('aivena-api-endpoint');
	}
	return apiBase;
}

export function setApiToken(token: string) {
	apiToken = token;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('aivena-api-token', token);
	}
}

export function getApiToken(): string | null {
	if (apiToken) return apiToken;
	if (typeof localStorage !== 'undefined') {
		apiToken = localStorage.getItem('aivena-api-token');
	}
	return apiToken;
}

export function clearSession() {
	apiBase = null;
	apiToken = null;
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem('aivena-api-endpoint');
		localStorage.removeItem('aivena-api-token');
	}
}

export function isConnected(): boolean {
	return !!getApiEndpoint() && !!getApiToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const base = getApiEndpoint();
	if (!base) throw new Error('API endpoint not configured');

	const token = getApiToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(`${base}${path}`, { ...options, headers });

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`API ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

// ── Heartbeat ──────────────────────────────────────────
export interface HeartbeatStatus {
	status: {
		active: boolean;
		running: boolean;
		intervalMinutes: number;
		lastRun: string | null;
		lastResult: string | null;
		runCount: number;
		okCount: number;
		alertCount: number;
	};
	history: unknown[];
}

export const heartbeat = {
	status: () => request<HeartbeatStatus>('/heartbeat'),
	start: () => request('/heartbeat', { method: 'POST', body: JSON.stringify({ action: 'start' }) }),
	stop: () => request('/heartbeat', { method: 'POST', body: JSON.stringify({ action: 'stop' }) }),
	run: () => request('/heartbeat', { method: 'POST', body: JSON.stringify({ action: 'run' }) })
};

// ── Jobs / Telemetry ───────────────────────────────────
export interface JobStats {
	jobs: number;
	errors: number;
	tokens: number;
	cost: number;
	toolCalls: number;
	avgDurationMs: number;
}

export interface RecentJob {
	id: string;
	channel: string;
	status: string;
	prompt: string;
	model: string | null;
	provider: string | null;
	input_tokens: number;
	output_tokens: number;
	total_tokens: number;
	cost_total: number;
	tool_call_count: number;
	duration_ms: number | null;
	created_at: string;
}

export const jobs = {
	stats: (channel?: string) =>
		request<JobStats>(`/jobs/stats${channel ? `?channel=${channel}` : ''}`),
	recent: (limit = 20) => request<RecentJob[]>(`/jobs/recent?limit=${limit}`),
	models: () => request('/jobs/models'),
	tools: () => request('/jobs/tools')
};

// ── Dashboard ──────────────────────────────────────────
export const dashboard = {
	config: () => request('/dashboard/config'),
	prompt: (prompt: string) =>
		request('/dashboard/prompt', {
			method: 'POST',
			body: JSON.stringify({ prompt })
		})
};

// ── Calendar ───────────────────────────────────────────
export interface CalendarEvent {
	id: number;
	title: string;
	description: string | null;
	start_time: string;
	end_time: string | null;
	all_day: boolean;
	recurrence: string | null;
}

export const calendar = {
	list: (start: string, end: string) =>
		request<CalendarEvent[]>(`/calendar?start=${start}&end=${end}`),
	create: (event: Partial<CalendarEvent>) =>
		request<CalendarEvent>('/calendar', { method: 'POST', body: JSON.stringify(event) }),
	update: (event: Partial<CalendarEvent> & { id: number }) =>
		request<CalendarEvent>('/calendar', { method: 'PATCH', body: JSON.stringify(event) }),
	delete: (id: number) =>
		request('/calendar', { method: 'DELETE', body: JSON.stringify({ id }) })
};

// ── CRM ────────────────────────────────────────────────
export interface Contact {
	id: number;
	first_name: string;
	last_name: string | null;
	email: string | null;
	phone: string | null;
	company_id: number | null;
	notes: string | null;
	tags: string | null;
	birthday: string | null;
}

export interface Company {
	id: number;
	name: string;
	industry: string | null;
	website: string | null;
}

export const crm = {
	contacts: (q?: string) => request<Contact[]>(`/crm/contacts${q ? `?q=${q}` : ''}`),
	contact: (id: number) => request<Contact>(`/crm/contacts/${id}`),
	companies: () => request<Company[]>('/crm/companies'),
	upcoming: () => request('/crm/reminders/upcoming'),
	interactions: () => request('/crm/interactions')
};

// ── Tasks (td) ─────────────────────────────────────────
export const td = {
	issues: () => request('/td/'),
	issue: (id: string) => request(`/td/${id}`)
};
