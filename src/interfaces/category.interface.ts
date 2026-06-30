export interface ICategory  {
    id: string
    name: string
    description? :string
    image?: string
    isActive: boolean
    bookCount?: number
    createdAt?: string
    updatedAt?: string 
}