
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import type { Task, TaskStatus, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Card, CardContent } from "../ui/card";
import { useTaskData } from "@/hooks/use-task-data";
import { useToast } from "@/hooks/use-toast";
import { isDirector, isEmployee } from "@/lib/roles";


const statusColors: Record<TaskStatus, string> = {
  "To-do": "bg-gray-500 border-transparent text-white",
  "In Progress": "bg-blue-500 border-transparent text-white",
  "In Review": "bg-yellow-500 border-transparent text-yellow-900",
  "Completed": "bg-green-500 border-transparent text-white",
  "Blocked": "bg-red-500 border-transparent text-white",
};

interface TaskTableProps {
  tasks: Task[];
  currentUser: User;
  onEdit: (task: Task) => void;
}

export function TaskTable({ tasks, currentUser, onEdit }: TaskTableProps) {
  const { locale, t } = useLanguage();
  const { deleteTask } = useTaskData();
  const { toast } = useToast();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      toast({
        title: t('all_tasks.toast.delete_success_title', {defaultValue: "Task Deleted"}),
        description: t('all_tasks.toast.delete_success_desc', { title: taskToDelete.title[locale] }),
      });
      setTaskToDelete(null);
    }
  };

  const canDeleteTask = (task: Task): boolean => {
    // Level 2 (Directors) and 3 (Super Admins) can delete any task.
    if (isDirector(currentUser.role)) {
      return true;
    }
    // Level 1 (Employees) can only delete tasks that are in 'To-do' or 'In Progress' status.
    if (isEmployee(currentUser.role)) {
      return task.status === 'To-do' || task.status === 'In Progress';
    }
    return false;
  };
  
  const canEditTask = (task: Task): boolean => {
    // Anyone can edit a task for now. More specific logic can be added here.
    return true;
  };

  if (tasks.length === 0) {
      return (
          <div className="text-center p-10 rounded-xl md:rounded-2xl bg-secondary/50">
              <p className="font-bold text-sm md:text-base">{t('all_tasks.no_tasks_title', { defaultValue: 'No Tasks Found' })}</p>
              <p className="text-sm text-muted-foreground">{t('all_tasks.no_tasks_desc', { defaultValue: 'Try adjusting your search or filter.' })}</p>
          </div>
      )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">{t('all_tasks.table.task')}</TableHead>
              <TableHead className="w-[15%]">{t('all_tasks.table.status')}</TableHead>
              <TableHead className="w-[25%]">{t('all_tasks.table.team')}</TableHead>
              <TableHead className="w-[15%] hidden sm:table-cell">{t('all_tasks.table.due_date')}</TableHead>
              <TableHead className="w-[5%]">
                <span className="sr-only">{t('all_tasks.table.actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <Link href={`/tasks/${task.id}`} className="hover:underline break-words transition-all active:scale-95">
                    {task.title[locale]}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={cn(statusColors[task.status])}>
                    {t(`all_tasks.status.${task.status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: task.status})}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {task.assignees.map((user) => (
                      <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" className="transition-all active:scale-95 h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${task.id}`}>{t('all_tasks.actions.view')}</Link>
                      </DropdownMenuItem>
                       {canEditTask(task) && (
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>{t('all_tasks.actions.edit')}</span>
                        </DropdownMenuItem>
                       )}
                       {canDeleteTask(task) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{t('all_tasks.actions.delete')}</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-3">
          {tasks.map((task) => (
              <Card key={task.id} className="card-spotlight border border-transparent hover:border-primary/50 transition-all active:scale-95 rounded-xl">
                  <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-3">
                          <Link href={`/tasks/${task.id}`} className="flex-1 pr-2">
                            <p className="font-semibold text-sm text-card-foreground hover:underline">{task.title[locale]}</p>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="transition-all active:scale-95 h-7 w-7 -mt-1 -mr-1">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/tasks/${task.id}`}>{t('all_tasks.actions.view')}</Link>
                              </DropdownMenuItem>
                              {canEditTask(task) && (
                                <DropdownMenuItem onClick={() => onEdit(task)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>{t('all_tasks.actions.edit')}</span>
                                </DropdownMenuItem>
                              )}
                               {canDeleteTask(task) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>{t('all_tasks.actions.delete')}</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <div className="flex -space-x-2">
                          {task.assignees.map((user) => (
                            <Avatar key={user.id} className="h-7 w-7 border-2 border-card">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge className={cn("text-xs whitespace-nowrap", statusColors[task.status])}>
                            {t(`all_tasks.status.${task.status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: task.status})}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      {taskToDelete && (
        <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('all_tasks.delete_dialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('all_tasks.delete_dialog.description', { title: taskToDelete.title[locale] })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('all_tasks.delete_dialog.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                {t('all_tasks.delete_dialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
