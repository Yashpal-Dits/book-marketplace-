import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories.api'
import { queryKeys } from '@/utils/queryKeys'

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.getCategories,
  })