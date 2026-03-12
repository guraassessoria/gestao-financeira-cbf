declare module 'lucide-react' {
	import type { ComponentType, SVGProps } from 'react'

	export interface LucideProps extends SVGProps<SVGSVGElement> {
		size?: string | number
		absoluteStrokeWidth?: boolean
	}

	export type LucideIcon = ComponentType<LucideProps>

	export const AlertCircle: LucideIcon
	export const BarChart3: LucideIcon
	export const Bell: LucideIcon
	export const Briefcase: LucideIcon
	export const Calculator: LucideIcon
	export const CheckCircle: LucideIcon
	export const ChevronRight: LucideIcon
	export const DollarSign: LucideIcon
	export const LayoutDashboard: LucideIcon
	export const Lock: LucideIcon
	export const LogIn: LucideIcon
	export const LogOut: LucideIcon
	export const Menu: LucideIcon
	export const PieChart: LucideIcon
	export const SearchCheck: LucideIcon
	export const Settings: LucideIcon
	export const ShieldCheck: LucideIcon
	export const TrendingDown: LucideIcon
	export const TrendingUp: LucideIcon
	export const Trophy: LucideIcon
	export const Upload: LucideIcon
	export const User: LucideIcon
	export const Users: LucideIcon
	export const X: LucideIcon
}
