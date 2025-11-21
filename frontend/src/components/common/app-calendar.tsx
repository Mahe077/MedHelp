"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface AppCalendarProps {
    id: string;
    label: string;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    buttonClassName?: string;
    placeholder?: string;
}

export function AppCalendar({ id, label, date, onDateChange, buttonClassName, placeholder = "Select date" }: AppCalendarProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor={id} className="px-1">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className={cn("w-48 justify-between font-normal text-foreground", buttonClassName)}
                    >
                        {date ? date.toLocaleDateString() : placeholder}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-card" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                            onDateChange(selectedDate)
                            setOpen(false)
                        }}
                        captionLayout="dropdown"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}