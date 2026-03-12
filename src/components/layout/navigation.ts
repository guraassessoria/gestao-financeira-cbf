import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Trophy,
  Briefcase,
  Upload,
  LogOut,
  LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  description?: string
  children?: NavItem[]
}

export const mainNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Painel executivo com KPIs',
  },
  {
    label: 'Demonstrações',
    href: '/demonstracoes',
    icon: BarChart3,
    description: 'DRE, BP, DFC, DRA',
    children: [
      {
        label: 'DRE',
        href: '/demonstracoes/dre',
        icon: TrendingUp,
      },
      {
        label: 'Balanço Patrimonial',
        href: '/demonstracoes/bp',
        icon: TrendingUp,
      },
      {
        label: 'Fluxo de Caixa',
        href: '/demonstracoes/dfc',
        icon: TrendingUp,
      },
      {
        label: 'Mutação do Patrimônio',
        href: '/demonstracoes/dra',
        icon: TrendingUp,
      },
    ],
  },
  {
    label: 'Índices',
    href: '/indices',
    icon: TrendingUp,
    description: 'Indicadores financeiros',
  },
  {
    label: 'Competições',
    href: '/competicoes',
    icon: Trophy,
    description: 'Análise por competição',
  },
  {
    label: 'Centros de Custo',
    href: '/centros-de-custo',
    icon: Briefcase,
    description: 'Análise por CC',
  },
  {
    label: 'Upload',
    href: '/upload',
    icon: Upload,
    description: 'Ingestão de dados CT2',
  },
]

export const userNavigation = [
  { label: 'Perfil', href: '/profile' },
  { label: 'Preferências', href: '/settings' },
  { label: 'Sair', href: '/logout', icon: LogOut },
]
