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

const admins = ref([])
const editingId = ref(null)
const form = ref({ adminId: "", firstName: "", lastName: "", department: "", file: null })
const successMessage = ref("")
const errorMessage = ref("")

const adminSchema = z.object({
  adminId: z.coerce.number().int().positive("Admin ID must be a positive integer"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  department: z.string().min(1, "Department is required"),
})

// Initialize form with Zod validation
const { handleSubmit, errors, values, resetForm } = useForm({
  validationSchema: toTypedSchema(adminSchema)
})

// Bind each field
const { value: adminId } = useField("adminId")
const { value: firstName } = useField("firstName")
const { value: lastName } = useField("lastName")
const { value: department } = useField("department")

// Fetch all admins
async function fetchAdmins() {
  try {
    const res = await fetch("http://localhost:3000/api/admins")
    admins.value = await res.json()
  } catch (err) {
    errorMessage.value = "Failed to fetch admins."
  }
}

// Start editing
function editAdmin(admin) {
  editingId.value = admin._id
  adminId.value = admin.adminId
  firstName.value = admin.firstName
  lastName.value = admin.lastName
  department.value = admin.department
  form.value.file = null
}

// Cancel editing
function cancelEdit() {
  editingId.value = null
  resetForm()
  form.value = { adminId: "", firstName: "", lastName: "", department: "", file: null }
}

// Update admin with form validation
const onSubmit = handleSubmit(async (formData) => {
  try {
    const data = new FormData()
    data.append("adminId", formData.adminId.toString()) // Convert number to string for FormData
    data.append("firstName", formData.firstName)
    data.append("lastName", formData.lastName)
    data.append("department", formData.department)
    if (form.value.file) {
      data.append("file", form.value.file)
    }

    const res = await fetch(`http://localhost:3000/api/admins/${editingId.value}`, {
      method: "PUT",
      body: data
    })

    if (res.ok) {
      successMessage.value = "Admin updated successfully!"
      errorMessage.value = ""
      cancelEdit()
      await fetchAdmins()
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

// Delete admin
async function deleteAdmin(id) {
  if (!confirm("Are you sure you want to delete this admin?")) return
  try {
    const res = await fetch(`http://localhost:3000/api/admins/${id}`, { method: "DELETE" })

    if (res.ok) {
      successMessage.value = "Admin deleted successfully!"
      errorMessage.value = ""
      await fetchAdmins()
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

// Handle file upload
function handleFileChange(e) {
  form.value.file = e.target.files[0]
}

onMounted(fetchAdmins)
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
        Admin List
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

    <!-- Admin Table -->
    <div class="rounded-md">
      <Table>
        <TableHeader>
          <TableRow class="border-b-2 border-black">
            <TableHead class="w-[100px]">Admin ID</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="admin in admins" :key="admin._id" class="border-b-2 border-black">
            <TableCell class="font-medium">{{ admin.adminId }}</TableCell>
            <TableCell>{{ admin.firstName }}</TableCell>
            <TableCell>{{ admin.lastName }}</TableCell>
            <TableCell>{{ admin.department }}</TableCell>
            <TableCell>
              <img 
                v-if="admin.profileImage" 
                :src="`http://localhost:3000/${admin.profileImage}`" 
                class="h-12 w-12 rounded-full object-cover border" 
                :alt="`${admin.firstName} ${admin.lastName}`"
              />
              <span v-else class="text-muted-foreground">No image</span>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end space-x-2">
                <Button size="sm" @click="editAdmin(admin)">Edit</Button>
                <Button size="sm" variant="destructive" @click="deleteAdmin(admin._id)">
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
        <CardTitle>Edit Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <FormField name="adminId" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="adminId">Admin ID</FormLabel>
              <FormControl>
                <Input 
                  id="adminId" 
                  type="number" 
                  placeholder="Admin ID" 
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

          <FormField name="department" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="department">Department</FormLabel>
              <FormControl>
                <Input 
                  id="department" 
                  type="text" 
                  placeholder="Department" 
                  v-bind="componentField" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormItem>
            <FormLabel for="file">Select Profile</FormLabel>
            <FormControl>
              <Input id="file" name="file" type="file" @change="handleFileChange" />
            </FormControl>
          </FormItem>

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