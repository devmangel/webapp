import { NextRequest } from 'next/server';
import { BotDetection } from '../types/security';

const botSignatures = [
  // Motores de búsqueda legítimos
  { regex: /googlebot\/(\d+\.\d+)/i, name: 'GoogleBot', category: 'search_engine' as const, description: 'Rastreador oficial de Google' },
  { regex: /bingbot\/(\d+\.\d+)/i, name: 'BingBot', category: 'search_engine' as const, description: 'Rastreador oficial de Microsoft Bing' },
  { regex: /yandexbot\/(\d+\.\d+)/i, name: 'YandexBot', category: 'search_engine' as const, description: 'Rastreador oficial de Yandex' },
  { regex: /baiduspider\/(\d+\.\d+)/i, name: 'BaiduSpider', category: 'search_engine' as const, description: 'Rastreador oficial de Baidu' },
  { regex: /duckduckbot\/(\d+\.\d+)/i, name: 'DuckDuckBot', category: 'search_engine' as const, description: 'Rastreador de DuckDuckGo' },
  
  // Rastreadores sociales legítimos
  { regex: /facebookexternalhit\/(\d+\.\d+)/i, name: 'FacebookBot', category: 'social_media' as const, description: 'Bot oficial de vista previa de Facebook' },
  { regex: /twitterbot\/(\d+\.\d+)/i, name: 'TwitterBot', category: 'social_media' as const, description: 'Bot oficial de Twitter/X' },
  { regex: /whatsapp\/(\d+\.\d+)/i, name: 'WhatsAppBot', category: 'social_media' as const, description: 'Bot oficial de WhatsApp' },
  { regex: /linkedinbot\/(\d+\.\d+)/i, name: 'LinkedInBot', category: 'social_media' as const, description: 'Bot oficial de LinkedIn' },
  
  // Herramientas de seguridad conocidas
  { regex: /nmap/i, name: 'Nmap', category: 'security_tool' as const, description: 'Herramienta de escaneo de puertos y seguridad' },
  { regex: /zgrab/i, name: 'ZGrab', category: 'security_tool' as const, description: 'Escáner masivo de aplicaciones web' },
  { regex: /masscan/i, name: 'Masscan', category: 'security_tool' as const, description: 'Escáner de puertos a gran escala' },
  { regex: /nuclei/i, name: 'Nuclei', category: 'security_tool' as const, description: 'Escáner de vulnerabilidades' },
  { regex: /nikto/i, name: 'Nikto', category: 'security_tool' as const, description: 'Escáner de vulnerabilidades web' },
  { regex: /wpscan/i, name: 'WPScan', category: 'security_tool' as const, description: 'Escáner de vulnerabilidades de WordPress' },
  { regex: /burp/i, name: 'Burp Suite', category: 'security_tool' as const, description: 'Herramienta de pruebas de seguridad web' },
  { regex: /OWASP-?(?:ZAP)?/i, name: 'OWASP ZAP', category: 'security_tool' as const, description: 'Escáner de seguridad de OWASP' },
  
  // Malware y maliciosos
  { regex: /xmrig/i, name: 'XMRig', category: 'malicious' as const, description: 'Minería de criptomonedas' },
  { regex: /(?:sqlmap|sql-map)/i, name: 'SQLMap', category: 'malicious' as const, description: 'Herramienta de inyección SQL automatizada' },
  { regex: /metasploit/i, name: 'Metasploit', category: 'malicious' as const, description: 'Framework de explotación' },
  { regex: /semrush/i, name: 'SEMrush', category: 'crawler' as const, description: 'Herramienta SEO' },
  { regex: /ahrefsbot/i, name: 'AhrefsBot', category: 'crawler' as const, description: 'Crawler de Ahrefs' },
  { regex: /majestic/i, name: 'Majestic', category: 'crawler' as const, description: 'Crawler SEO' },
  { regex: /screaming.*frog/i, name: 'Screaming Frog', category: 'crawler' as const, description: 'Crawler SEO' },
  
  // Detectar posibles bots genéricos
  { regex: /bot|crawler|spider|scan/i, name: 'Unknown Bot', category: 'unknown' as const, description: 'Bot genérico no identificado' },
  { regex: /\S+\.(ru|cn)\S+/i, name: 'Suspicious Regional Bot', category: 'unknown' as const, description: 'Bot de región potencialmente sospechosa' },
];

export function detectBot(req: NextRequest): BotDetection[] {
  const userAgent = req.headers.get('user-agent') || '';
  const results: BotDetection[] = [];
  
  // Evaluar cada firma con nivel de confianza
  for (const signature of botSignatures) {
    const match = userAgent.match(signature.regex);
    if (match) {
      let confidence = 0.7; // Confianza base
      
      // Aumentar confianza si hay una versión específica
      if (match[1] && !isNaN(parseFloat(match[1]))) {
        confidence = 0.9;
      }
      
      // Ajustar para patrones genéricos
      if (signature.name === 'Unknown Bot') {
        confidence = 0.5;
      }
      
      results.push({
        name: signature.name,
        category: signature.category,
        confidence,
        description: signature.description
      });
    }
  }

  // Análisis adicional de anomalías en el User-Agent
  if (userAgent) {
    if (userAgent.length < 10) {
      results.push({
        name: 'Suspicious User-Agent',
        category: 'malicious',
        confidence: 0.6,
        description: 'User-Agent anormalmente corto'
      });
    }
    
    if (!/mozilla|webkit|gecko|chrome|safari|firefox|edg|opera/i.test(userAgent) && userAgent.length > 5) {
      results.push({
        name: 'Non-standard User-Agent',
        category: 'malicious',
        confidence: 0.5,
        description: 'No sigue patrones estándar de navegadores'
      });
    }
  }
  
  return results;
}
