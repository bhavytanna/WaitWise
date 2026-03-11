import { apiRequest } from './apiClient';
import { getAuth } from './authStore';

export type DoctorDto = {
  id: string;
  name: string;
  department: string;
  departmentCode: string;
  avgConsultTime: number;
};

export type RegisterPatientResult = {
  patientId: string;
  tokenNumber: string;
  doctorName: string;
  patientsAhead: number;
  estimatedWaitTimeMinutes: number;
};

export type QueueItemDto = {
  _id: string;
  doctorId: string;
  patientId: string;
  tokenNumber: string;
  priority?: 'normal' | 'emergency';
  status: 'waiting' | 'called' | 'in_consultation' | 'done';
  createdAt: string;
  updatedAt: string;
};

export type QueueResponse = {
  doctor: {
    id: string;
    name: string;
    department: string;
    departmentCode: string;
    avgConsultTime: number;
  };
  current: QueueItemDto | null;
  next: QueueItemDto | null;
  queue: QueueItemDto[];
};

export type LoginResult = {
  token: string;
  user: {
    id: string;
    username: string;
    role: 'doctor' | 'admin' | 'patient';
    doctorId?: string;
  };
};

export type PatientStatusResponse = {
  patient: {
    id: string;
    name: string;
    age: number;
    phone: string;
    tokenNumber: string;
    priority: 'normal' | 'emergency';
    status: 'waiting' | 'in_consultation' | 'done';
    arrivalTime: string;
  };
  doctor: {
    id: string;
    name: string;
    department: string;
    avgConsultTime: number;
  };
  patientsAhead: number;
  estimatedWaitTimeMinutes: number;
};

export type AdminStats = {
  doctorCount: number;
  patientCount: number;
  totals: {
    waiting: number;
    called: number;
    in_consultation: number;
    done: number;
  };
  doctors: Array<{
    id: string;
    name: string;
    department: string;
    avgConsultTime: number;
    queue: {
      waiting: number;
      called: number;
      in_consultation: number;
      done: number;
    };
  }>;
};

export function listDoctors() {
  return apiRequest<DoctorDto[]>('/api/doctors');
}

export function registerPatient(body: { name: string; age: number; phone: string; doctorId: string }) {
  return apiRequest<RegisterPatientResult>('/api/patient/register', { method: 'POST', body });
}

export function login(body: { username: string; password: string }) {
  return apiRequest<LoginResult>('/api/auth/login', { method: 'POST', body });
}

export function patientLogin(body: { patientId: string; phone: string }) {
  return apiRequest<LoginResult>('/api/patient/login', { method: 'POST', body });
}

export function getQueue(doctorId: string) {
  return apiRequest<QueueResponse>(`/api/queue/${doctorId}`);
}

export function getPatientStatusById(patientId: string) {
  return apiRequest<PatientStatusResponse>(`/api/patient/${patientId}`);
}

export function getMyPatientStatus() {
  const auth = getAuth();
  return apiRequest<PatientStatusResponse>('/api/patient/me', { token: auth?.token });
}

export type TriagePatientDto = {
  id: string;
  name: string;
  age: number;
  phone: string;
  tokenNumber: string;
  status: 'waiting' | 'in_consultation' | 'done';
  priority: 'normal' | 'emergency';
  arrivalTime: string;
};

export function listTriagePatients(doctorId: string) {
  const auth = getAuth();
  return apiRequest<TriagePatientDto[]>(`/api/admin/triage/${doctorId}/patients`, { token: auth?.token });
}

export function adminSetPatientPriority(patientId: string, priority: 'normal' | 'emergency') {
  const auth = getAuth();
  return apiRequest<{ patientId: string; doctorId: string; priority: 'normal' | 'emergency' }>(
    `/api/admin/triage/patient/${patientId}/priority`,
    { method: 'PATCH', body: { priority }, token: auth?.token },
  );
}

export function doctorSetPatientPriority(patientId: string, priority: 'normal' | 'emergency') {
  const auth = getAuth();
  return apiRequest<{ patientId: string; doctorId: string; priority: 'normal' | 'emergency' }>(
    `/api/doctors/patient/${patientId}/priority`,
    { method: 'PATCH', body: { priority }, token: auth?.token },
  );
}

export function nextPatient(doctorId: string) {
  const auth = getAuth();
  return apiRequest<QueueResponse>('/api/queue/next', {
    method: 'POST',
    body: { doctorId },
    token: auth?.token,
  });
}

export function callPatient(doctorId: string) {
  const auth = getAuth();
  return apiRequest<QueueResponse>('/api/queue/call', {
    method: 'POST',
    body: { doctorId },
    token: auth?.token,
  });
}

export function adminStats() {
  const auth = getAuth();
  return apiRequest<AdminStats>('/api/admin/stats', { token: auth?.token });
}

export function addDoctor(body: {
  name: string;
  department: string;
  departmentCode: string;
  avgConsultTime: number;
  username: string;
  password?: string;
}) {
  const auth = getAuth();
  return apiRequest<DoctorDto>('/api/doctors', { method: 'POST', body, token: auth?.token });
}

export function deleteDoctor(id: string) {
  const auth = getAuth();
  return apiRequest<{ id: string }>(`/api/doctors/${id}`, { method: 'DELETE', token: auth?.token });
}

export function updateConsultTime(id: string, avgConsultTime: number) {
  const auth = getAuth();
  return apiRequest<{ id: string; avgConsultTime: number }>(`/api/doctors/${id}/consult-time`, {
    method: 'PATCH',
    body: { avgConsultTime },
    token: auth?.token,
  });
}
