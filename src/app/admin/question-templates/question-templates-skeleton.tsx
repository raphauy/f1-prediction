import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function QuestionTemplatesSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plantilla</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Puntos por defecto</TableHead>
            <TableHead className="text-center">Veces usada</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[300px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[120px]" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-6 w-[60px] mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-[30px] mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}