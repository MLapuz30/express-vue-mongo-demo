<script setup>
import { ref, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-vue-next"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm, useField } from "vee-validate"
import { z } from "zod"
import { toTypedSchema } from "@vee-validate/zod"

const students = ref([])
const editingId = ref(null)
const successMessage = ref("")
const errorMessage = ref("")

const studentSchema = z.object({
  studentId: z.coerce.number().int().positive("Student ID must be a positive integer"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  section: z.string().min(1, "Section is required"),
})

// Initialize form with Zod validation
const { handleSubmit, errors, values, resetForm } = useForm({
  validationSchema: toTypedSchema(studentSchema)
})

// Bind each field
const { value: studentId } = useField("studentId")
const { value: firstName } = useField("firstName")
const { value: lastName } = useField("lastName")
const { value: section } = useField("section")

// Fetch all students
async function fetchStudents() {
  try {
    const res = await fetch("http://localhost:3000/api/students")
    students.value = await res.json()
  } catch (err) {
    errorMessage.value = "Failed to fetch students."
  }
}

// Start editing
function editStudent(student) {
  editingId.value = student._id
  studentId.value = student.studentId
  firstName.value = student.firstName
  lastName.value = student.lastName
  section.value = student.section
}

// Cancel editing
function cancelEdit() {
  editingId.value = null
  resetForm()
}

// Update student with form validation
const onSubmit = handleSubmit(async (formData) => {
  try {
    const res = await fetch(`http://localhost:3000/api/students/${editingId.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        studentId: formData.studentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        section: formData.section
      })
    })

    if (res.ok) {
      successMessage.value = "Student updated successfully!"
      errorMessage.value = ""
      cancelEdit()
      await fetchStudents()
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ""
      }, 3000)
    } else {
      const responseData = await res.json()
      errorMessage.value = responseData.message || "Update failed."
    }
  } catch (err) {
    errorMessage.value = "Server error while updating."
  }
})

// Delete student
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return
  try {
    const res = await fetch(`http://localhost:3000/api/students/${id}`, { method: "DELETE" })

    if (res.ok) {
      successMessage.value = "Student deleted successfully!"
      errorMessage.value = ""
      await fetchStudents()
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ""
      }, 3000)
    } else {
      const data = await res.json()
      errorMessage.value = data.message || "Delete failed."
    }
  } catch (err) {
    errorMessage.value = "Server error while deleting."
  }
}

onMounted(fetchStudents)
</script>

<template>
  <div class="min-h-screen p-6 bg-background">
    <div class="flex items-center justify-between mb-6">
      <!-- Left: Back link -->
      <router-link 
        to="/" 
        class="text-sm text-muted-foreground hover:underline"
      >
        Back
      </router-link>

      <!-- Center: Title -->
      <h1 class="text-2xl font-bold text-center flex-1">
        Student List
      </h1>

      <!-- Right: empty placeholder (keeps title centered) -->
      <div class="w-12"></div>
    </div>

    <!-- Success Alert -->
    <Alert v-if="successMessage" class="mb-4 border-green-500 text-green-700 bg-green-50">
      <CheckCircle2 class="h-5 w-5 text-green-600" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>{{ successMessage }}</AlertDescription>
    </Alert>

    <!-- Error Alert -->
    <Alert v-if="errorMessage" class="mb-4 border-red-500 text-red-700 bg-red-50">
      <XCircle class="h-5 w-5 text-red-600" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- Student Table -->
    <div class="rounded-md">
      <Table>
        <TableHeader>
          <TableRow class="border-b-2 border-black">
            <TableHead class="w-[100px]">Student ID</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Section</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="student in students" :key="student._id" class="border-b-2 border-black">
            <TableCell class="font-medium">{{ student.studentId }}</TableCell>
            <TableCell>{{ student.firstName }}</TableCell>
            <TableCell>{{ student.lastName }}</TableCell>
            <TableCell>{{ student.section }}</TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end space-x-2">
                <Button size="sm" @click="editStudent(student)">Edit</Button>
                <Button size="sm" variant="destructive" @click="deleteStudent(student._id)">
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Edit Form -->
    <Card v-if="editingId" class="mt-6">
      <CardHeader>
        <CardTitle>Edit Student</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <FormField name="studentId" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="studentId">Student ID</FormLabel>
              <FormControl>
                <Input 
                  id="studentId" 
                  type="number" 
                  placeholder="Student ID" 
                  v-bind="componentField" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="firstName" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="firstName">First Name</FormLabel>
              <FormControl>
                <Input 
                  id="firstName" 
                  type="text" 
                  placeholder="First Name" 
                  v-bind="componentField" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="lastName" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="lastName">Last Name</FormLabel>
              <FormControl>
                <Input 
                  id="lastName" 
                  type="text" 
                  placeholder="Last Name" 
                  v-bind="componentField" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="section" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="section">Section</FormLabel>
              <FormControl>
                <Input 
                  id="section" 
                  type="text" 
                  placeholder="Section" 
                  v-bind="componentField" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="flex gap-2">
            <Button type="submit" class="flex-1">Update</Button>
            <Button type="button" variant="secondary" class="flex-1" @click="cancelEdit">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>