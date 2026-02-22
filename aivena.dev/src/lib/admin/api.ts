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
		if (res.status === 401) {
			clearSession();
			if (typeof window !== 'undefined') {
				window.location.reload();
			}
			throw new Error('Session expired — redirecting to login');
		}
		const text = await res.text().catch(() => '');
		throw new Error(`API ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

// ── Heartbeat ──────────────────────────────────────────

export interface HeartbeatHistoryEntry {
	ok: boolean;
	response: string;
	durationMs: number;
	time: string;
}

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
	history: HeartbeatHistoryEntry[];
}

export const heartbeat = {
	status: () => request<HeartbeatStatus>('/api/heartbeat'),
	start: () => request('/api/heartbeat', { method: 'POST', body: JSON.stringify({ action: 'start' }) }),
	stop: () => request('/api/heartbeat', { method: 'POST', body: JSON.stringify({ action: 'stop' }) }),
	run: () => request('/api/heartbeat', { method: 'POST', body: JSON.stringify({ action: 'run' }) })
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

export interface ToolBreakdown {
	tool_name: string;
	call_count: number;
	error_count: number;
	avg_duration_ms: number;
}

export interface ModelBreakdown {
	model: string;
	job_count: number;
	tokens_total: number;
	cost_total: number;
}

export interface DailyStat {
	date: string;
	jobs: number;
	errors: number;
	tokens: number;
	cost: number;
}

export const jobs = {
	stats: (channel?: string) =>
		request<JobStats>(`/api/jobs/stats${channel ? `?channel=${channel}` : ''}`),
	recent: (limit = 20, channel?: string) => {
		const params = new URLSearchParams({ limit: String(limit) });
		if (channel) params.set('channel', channel);
		return request<RecentJob[]>(`/api/jobs/recent?${params}`);
	},
	models: (days = 30) => request<ModelBreakdown[]>(`/api/jobs/models?days=${days}`),
	tools: (days = 30) => request<ToolBreakdown[]>(`/api/jobs/tools?days=${days}`),
	daily: (days = 30, channel?: string) => {
		const params = new URLSearchParams({ days: String(days) });
		if (channel) params.set('channel', channel);
		return request<DailyStat[]>(`/api/jobs/daily?${params}`);
	}
};

// ── Dashboard ──────────────────────────────────────────

export const dashboard = {
	config: () => request('/api/dashboard/config'),
	prompt: (prompt: string) =>
		request('/api/dashboard/prompt', {
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
	color: string | null;
}

export const calendar = {
	list: (start: string, end: string) =>
		request<CalendarEvent[]>(`/api/calendar?start=${start}&end=${end}`),
	create: (event: Partial<CalendarEvent>) =>
		request<CalendarEvent>('/api/calendar', { method: 'POST', body: JSON.stringify(event) }),
	update: (event: Partial<CalendarEvent> & { id: number }) =>
		request<CalendarEvent>('/api/calendar', { method: 'PATCH', body: JSON.stringify(event) }),
	delete: (id: number) =>
		request('/api/calendar', { method: 'DELETE', body: JSON.stringify({ id }) })
};

// ── CRM ────────────────────────────────────────────────

export interface Contact {
	id: number;
	first_name: string;
	last_name: string | null;
	email: string | null;
	phone: string | null;
	company_id: number | null;
	company_name: string | null;
	notes: string | null;
	tags: string | null;
	birthday: string | null;
	anniversary: string | null;
}

export interface ContactDetail {
	contact: Contact;
	interactions: Interaction[];
	reminders: Reminder[];
	relationships: Relationship[];
	groups: Group[];
}

export interface Company {
	id: number;
	name: string;
	industry: string | null;
	website: string | null;
}

export interface Interaction {
	id: number;
	contact_id: number;
	interaction_type: string;
	summary: string;
	notes: string | null;
	happened_at: string;
	first_name?: string;
	last_name?: string;
}

export interface Reminder {
	id: number;
	contact_id: number;
	reminder_type: string;
	reminder_date: string;
	message: string | null;
	first_name?: string;
	last_name?: string;
}

export interface Relationship {
	id: number;
	contact_id: number;
	related_contact_id: number;
	relationship_type: string;
	related_first_name?: string;
	related_last_name?: string;
}

export interface Group {
	id: number;
	name: string;
	description: string | null;
	member_count?: number;
}

export const crm = {
	contacts: (q?: string) => request<Contact[]>(`/api/crm/contacts${q ? `?q=${q}` : ''}`),
	contact: (id: number) => request<ContactDetail>(`/api/crm/contacts/${id}`),
	createContact: (data: Partial<Contact> & { first_name: string }) =>
		request<Contact>('/api/crm/contacts', { method: 'POST', body: JSON.stringify(data) }),
	updateContact: (id: number, data: Partial<Contact>) =>
		request<Contact>(`/api/crm/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
	deleteContact: (id: number) =>
		request(`/api/crm/contacts/${id}`, { method: 'DELETE' }),
	companies: () => request<Company[]>('/api/crm/companies'),
	createCompany: (data: Partial<Company> & { name: string }) =>
		request<Company>('/api/crm/companies', { method: 'POST', body: JSON.stringify(data) }),
	interactions: (contactId?: number) =>
		request<Interaction[]>(`/api/crm/interactions${contactId ? `?contact_id=${contactId}` : ''}`),
	createInteraction: (data: { contact_id: number; interaction_type: string; summary: string; notes?: string }) =>
		request<Interaction>('/api/crm/interactions', { method: 'POST', body: JSON.stringify(data) }),
	deleteInteraction: (id: number) =>
		request(`/api/crm/interactions/${id}`, { method: 'DELETE' }),
	reminders: (contactId?: number) =>
		request<Reminder[]>(`/api/crm/reminders${contactId ? `?contact_id=${contactId}` : ''}`),
	upcoming: (days = 30) => request(`/api/crm/reminders/upcoming?days=${days}`),
	createReminder: (data: { contact_id: number; reminder_type: string; reminder_date: string; message?: string }) =>
		request<Reminder>('/api/crm/reminders', { method: 'POST', body: JSON.stringify(data) }),
	deleteReminder: (id: number) =>
		request(`/api/crm/reminders/${id}`, { method: 'DELETE' }),
	groups: () => request<Group[]>('/api/crm/groups'),
	createGroup: (data: { name: string; description?: string }) =>
		request<Group>('/api/crm/groups', { method: 'POST', body: JSON.stringify(data) }),
	groupMembers: (groupId: number) => request<Contact[]>(`/api/crm/groups/${groupId}/members`),
	addGroupMember: (groupId: number, contactId: number) =>
		request(`/api/crm/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ contact_id: contactId }) }),
	removeGroupMember: (groupId: number, contactId: number) =>
		request(`/api/crm/groups/${groupId}/members/${contactId}`, { method: 'DELETE' }),
	relationships: (contactId: number) =>
		request<Relationship[]>(`/api/crm/relationships?contact_id=${contactId}`),
	createRelationship: (data: { contact_id: number; related_contact_id: number; relationship_type: string }) =>
		request<Relationship>('/api/crm/relationships', { method: 'POST', body: JSON.stringify(data) }),
	deleteRelationship: (id: number) =>
		request(`/api/crm/relationships/${id}`, { method: 'DELETE' }),
	exportCsv: () => {
		const base = getApiEndpoint();
		const token = getApiToken();
		return fetch(`${base}/api/crm/contacts/export.csv`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		}).then(r => r.text());
	},
	importCsv: (csv: string) =>
		request('/api/crm/contacts/import', { method: 'POST', body: csv, headers: { 'Content-Type': 'text/csv' } })
};

// ── Tasks (td) ─────────────────────────────────────────

export interface TdIssue {
	id: string;
	title: string;
	status: string;
	priority: string;
	type: string;
	created_at: string;
	updated_at?: string;
	labels?: string[];
	tags?: string[];
	parent?: string;
	parent_id?: string;
	project?: string;
	implementer_session?: string;
	log_count?: number;
	has_handoff?: boolean;
	points?: number;
	last_log?: { message: string; type: string; timestamp: string } | null;
}

export interface TdIssueDetail {
	id: string;
	title: string;
	description: string;
	acceptance?: string;
	status: string;
	priority: string;
	type: string;
	labels: string[];
	created_at: string;
	updated_at?: string;
	parent?: string;
	parent_id?: string;
	children?: string[];
	project?: string;
	implementer_session?: string;
	points?: number;
	logs: { message: string; type: string; timestamp: string }[];
	handoff?: {
		done?: string[];
		remaining?: string[];
		decisions?: string[];
		uncertain?: string[];
		session?: string;
		timestamp?: string;
	};
	git?: {
		start_branch?: string;
		current_branch?: string;
		start_commit?: string;
		current_commit?: string;
		commits_since_start?: number;
		files_changed?: number;
		additions?: number;
		deletions?: number;
	};
	sessions?: { session_id: string; role?: string }[];
}

export interface TdTreeNode {
	id: string;
	title: string;
	status: string;
	priority: string;
	type: string;
	labels?: string[];
	implementer_session?: string;
}

export interface TdTreeEdge {
	source: string;
	target: string;
	type: string;
}

export interface TdTree {
	nodes: TdTreeNode[];
	edges: TdTreeEdge[];
}

export const td = {
	issues: (params?: { type?: string; priority?: string; all?: boolean; implementer?: string }) => {
		const p = new URLSearchParams();
		if (params?.type) p.set('type', params.type);
		if (params?.priority) p.set('priority', params.priority);
		if (params?.all) p.set('all', '1');
		if (params?.implementer) p.set('implementer', params.implementer);
		const qs = p.toString();
		return request<TdIssue[]>(`/api/td/${qs ? `?${qs}` : ''}`);
	},
	detail: (id: string) => request<TdIssueDetail>(`/api/td/detail?id=${id}`),
	tree: () => request<TdTree>('/api/td/tree'),
	config: () => request<{ crossProjectEnabled?: boolean; crossProjectDepth?: number }>('/api/td/config'),
	global: (params?: { type?: string; priority?: string; all?: boolean; project?: string; implementer?: string }) => {
		const p = new URLSearchParams();
		if (params?.type) p.set('type', params.type);
		if (params?.priority) p.set('priority', params.priority);
		if (params?.all) p.set('all', '1');
		if (params?.project) p.set('project', params.project);
		if (params?.implementer) p.set('implementer', params.implementer);
		return request<{ issues: TdIssue[]; projects: string[] }>(`/api/td/global?${p}`);
	},
	create: (data: { title: string; type?: string; priority?: string; description?: string; labels?: string; parent?: string }) =>
		request('/api/td/', { method: 'POST', body: JSON.stringify(data) }),
	update: (data: { id: string; status?: string; title?: string; priority?: string; description?: string; labels?: string }) =>
		request('/api/td/', { method: 'PATCH', body: JSON.stringify(data) }),
	delete: (id: string) =>
		request('/api/td/', { method: 'DELETE', body: JSON.stringify({ id }) }),
	log: (data: { id: string; message: string; type?: string }) =>
		request('/api/td/log', { method: 'POST', body: JSON.stringify(data) }),
	review: (data: { id: string; message?: string }) =>
		request('/api/td/review', { method: 'POST', body: JSON.stringify(data) }),
	approve: (data: { id: string; reason?: string }) =>
		request('/api/td/approve', { method: 'POST', body: JSON.stringify(data) }),
	reject: (data: { id: string; reason?: string }) =>
		request('/api/td/reject', { method: 'POST', body: JSON.stringify(data) }),
	handoff: (data: { id: string; done?: string[]; remaining?: string[]; decisions?: string[]; uncertain?: string[]; note?: string }) =>
		request('/api/td/handoff', { method: 'POST', body: JSON.stringify(data) })
};
