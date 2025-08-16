import { tool } from 'ai';
import { z } from 'zod';

/**
 * Full map of which KPIs each technology supports
 */
export const TABLE_KPIS = {
  gsm: [
    'erlang',
    'tch_availability',
    'hosr_all',
    'dcr',
    '2G_CSSR_IR(%)_MAPS',
  ] as const,
  umts: [
    'rab_drop_rate_cs',
    'payload_total_3g_gbyte',
    'hosr_soft',
    'hsdpa_frame_loss_rate_iub',
    'rtwp_avg_of_dbm_values',
    'throughput_hs_dc_nodeb_kbps',
    'cell_availability_system',
    'cssr_cs',
    'erlang_3g',
    'rab_drop_rate_hs',
  ] as const,
  lmbb: [
    'erlang_volte',
    'payload_pdcp_total_gbyte',
    'cssr_ps',
    'erab_drop_rate_maps',
    'erab_setup_succ_rate_qci1',
    'erab_drop_rate_volte_qci1',
    'hosr_intra_freq_out',
    'throughput_ue_all_qci_dl_kbps_maps',
    'interference_pusch_avg_maps',
    '4G_Interference_PUCCH_Avg_MAPS',
    'cell_availability_system',
  ] as const,
};
type Technology = keyof typeof TABLE_KPIS;

/**
 * Metadata for each KPI: display name + common synonyms
 */
export const KPI_METADATA: Record<
  string,
  { displayName: string; synonyms: string[] }
> = {
  // GSM
  erlang: { displayName: 'Erlang Traffic', synonyms: ['erl', 'traffic load'] },
  tch_availability: {
    displayName: 'TCH Availability',
    synonyms: ['tch avail', 'channel availability'],
  },
  hosr_all: {
    displayName: 'Handover Success Rate (All)',
    synonyms: ['hosr', 'handover success'],
  },
  dcr: {
    displayName: 'Drop Call Rate',
    synonyms: ['drop rate', 'dropped calls'],
  },
  '2G_CSSR_IR(%)_MAPS': {
    displayName: '2G CSSR IR (%) (MAPS)',
    synonyms: ['cssr ir', '2g cssr'],
  },
  // UMTS
  rab_drop_rate_cs: {
    displayName: 'RAB Drop Rate (CS)',
    synonyms: ['cs drop', 'rab cs'],
  },
  payload_total_3g_gbyte: {
    displayName: 'Total 3G Payload (GB)',
    synonyms: ['3g payload', 'data volume'],
  },
  hosr_soft: {
    displayName: 'Handover Success Rate (Soft)',
    synonyms: ['soft hosr'],
  },
  hsdpa_frame_loss_rate_iub: {
    displayName: 'HSDPA Frame Loss Rate (IuB)',
    synonyms: ['frame loss'],
  },
  rtwp_avg_of_dbm_values: {
    displayName: 'RTWP Avg (dBm)',
    synonyms: ['rtwp', 'received power'],
  },
  throughput_hs_dc_nodeb_kbps: {
    displayName: 'HS‑DC Throughput (kbps)',
    synonyms: ['hsdc throughput'],
  },
  cell_availability_system: {
    displayName: 'Cell Availability (System)',
    synonyms: ['cell avail', 'availability'],
  },
  cssr_cs: { displayName: 'CS Call Setup Success Rate', synonyms: ['cssr cs'] },
  erlang_3g: { displayName: '3G Erlang Traffic', synonyms: ['3g erlang'] },
  rab_drop_rate_hs: {
    displayName: 'RAB Drop Rate (HS)',
    synonyms: ['hs drop', 'rab hs'],
  },
  // LMBB
  erlang_volte: {
    displayName: 'VoLTE Erlang Traffic',
    synonyms: ['volte erlang'],
  },
  payload_pdcp_total_gbyte: {
    displayName: 'PDCP Payload Total (GB)',
    synonyms: ['pdcp payload'],
  },
  cssr_ps: { displayName: 'PS Call Setup Success Rate', synonyms: ['cssr ps'] },
  erab_drop_rate_maps: {
    displayName: 'ERAB Drop Rate (MAPS)',
    synonyms: ['erab drop'],
  },
  erab_setup_succ_rate_qci1: {
    displayName: 'ERAB Setup Success Rate (QCI1)',
    synonyms: ['erab setup'],
  },
  erab_drop_rate_volte_qci1: {
    displayName: 'VoLTE ERAB Drop Rate (QCI1)',
    synonyms: ['volte erab drop'],
  },
  hosr_intra_freq_out: {
    displayName: 'Intra‑Freq Handover Success Rate (Out)',
    synonyms: ['intra freq hosr'],
  },
  throughput_ue_all_qci_dl_kbps_maps: {
    displayName: 'UE Throughput All QCI DL (kbps)',
    synonyms: ['ue throughput'],
  },
  interference_pusch_avg_maps: {
    displayName: 'Avg PUSCH Interference (MAPS)',
    synonyms: ['pusch interference'],
  },
  '4G_Interference_PUCCH_Avg_MAPS': {
    displayName: 'Avg PUCCH Interference (MAPS)',
    synonyms: ['pucch interference'],
  },
};

const ALL_KPIS = Object.values(TABLE_KPIS).flat() as [string, ...string[]];

export const getKPI = tool({
  description: `
    Retrieve KPI metrics from our KPI API. 
    
    • Supported technologies (TABLE_KPIS): 
      – gsm: ${TABLE_KPIS.gsm.join(', ')} 
      – umts: ${TABLE_KPIS.umts.join(', ')} 
      – lmbb: ${TABLE_KPIS.lmbb.join(', ')}
    
    • KPI metadata (KPI_METADATA): 
      – erlang → Erlang Traffic (synonyms: erl, traffic load)
      – tch_availability → TCH Availability (synonyms: tch avail, channel availability)
      – hosr_all → Handover Success Rate (All) (synonyms: hosr, handover success)
      – dcr → Drop Call Rate (synonyms: drop rate, dropped calls)
      – 2G_CSSR_IR(%)_MAPS → 2G CSSR IR (%) (MAPS) (synonyms: cssr ir, 2g cssr)
      – …and similarly for all UMTS and LMBB KPIs as defined in KPI_METADATA.
    
    The tool requires a technology, a start_date/end_date, and at least one KPI (from the list above).
    You must also filter by either element or site substring. Optionally specify a limit.
  `,
  parameters: z
    .object({
      technology: z
        .enum(Object.keys(TABLE_KPIS) as [Technology, ...Technology[]])
        .describe('Which technology table to query: gsm, umts, or lmbb'),
      start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
        .describe('Start of date range (YYYY‑MM‑DD)'),
      end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
        .describe('End of date range (YYYY‑MM‑DD)'),
      element: z
        .string()
        .optional()
        .describe('Substring filter on the element field'),
      site: z
        .string()
        .optional()
        .describe('Substring filter on the site field'),
      kpi: z
        .array(z.enum(ALL_KPIS))
        .min(1, 'You must request at least one KPI')
        .describe('List of KPI keys to return'),
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Maximum number of rows to return'),
    })
    .refine((d) => d.element || d.site, {
      message: 'You must provide at least one of `element` or `site`',
      path: ['element'],
    }),
  execute: async (
    { technology, start_date, end_date, element, site, kpi, limit },
    { abortSignal },
  ) => {
    const url = new URL('http://localhost:8000/api/data');
    url.searchParams.set('technology', technology);
    url.searchParams.set('start_date', start_date);
    url.searchParams.set('end_date', end_date);
    if (element) url.searchParams.set('element', element);
    if (site) url.searchParams.set('site', site);
    kpi.forEach((key) => url.searchParams.append('kpi', key));
    if (limit) url.searchParams.set('limit', String(limit));
    console.log('im here');
    console.log(url.toString());
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: abortSignal,
    });

    if (!res.ok) {
      const body = await res.text();
      console.log(body);
      throw new Error(`getKPI failed (${res.status}): ${body}`);
    }
    return res.json();
  },
});
