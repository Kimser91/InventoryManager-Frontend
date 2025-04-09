<template>
  <div class="container mt-4">
    <h2>Brukere</h2>

    <button class="btn btn-primary mb-3" @click="showAddUser = true">Legg til ny bruker</button>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Brukernavn</th>
          <th>Email</th>
          <th>Rolle</th>
          <th>Handlinger</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" @click="editUser(user)" :disabled="!canEdit(user)">Rediger</button>
            <button class="btn btn-sm btn-danger" @click="deleteUser(user.id)" :disabled="!canDelete(user)">Slett</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showAddUser || selectedUser" class="card p-4 mt-4">
      <h3>{{ selectedUser ? 'Rediger bruker' : 'Legg til ny bruker' }}</h3>
      <form @submit.prevent="selectedUser ? updateUser() : addUser()">
        <div class="mb-3">
          <label>Brukernavn</label>
          <input v-model="form.username" class="form-control" required />
        </div>
        <div class="mb-3">
          <label>Email</label>
          <input v-model="form.email" type="email" class="form-control" required />
        </div>
        <div class="mb-3" v-if="!selectedUser">
          <label>Passord</label>
          <input v-model="form.password" type="password" class="form-control" required />
        </div>
        <div class="mb-3">
          <label>Rolle</label>
          <select v-model="form.role" class="form-control" required>
            <option value="Admin">Admin</option>
            <option value="Bruker">Bruker</option>
          </select>
        </div>

        <div class="mb-3">
          <label>Tilganger (områder)</label>
          <Multiselect
            v-model="form.permissions"
            :options="owners"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            placeholder="Velg områder"
            label="name"
            track-by="name"
            class="form-control"
          />
        </div>

        <div class="mb-3">
          <label>Ny tilgang (område)</label>
          <div class="input-group">
            <input v-model="newOwner" type="text" class="form-control" placeholder="Skriv nytt område">
            <button class="btn btn-success" type="button" @click="addNewOwner">Legg til</button>
          </div>
        </div>

        <div class="mb-3">
          <input class="form-check-input me-2" type="checkbox" id="canSeeAll" v-model="form.can_see_all" />
          <label class="form-check-label" for="canSeeAll">Kan se alt (superbruker)</label>
        </div>

        <div class="mb-3" v-if="selectedUser">
          <label>Endre passord (valgfritt)</label>
          <input v-model="newPassword" type="password" class="form-control" placeholder="Nytt passord">
        </div>

        <button type="submit" class="btn btn-success">{{ selectedUser ? 'Oppdater' : 'Legg til' }}</button>
        <button type="button" class="btn btn-secondary ms-2" @click="cancelEdit">Avbryt</button>
      </form>
    </div>
  </div>
</template>

<script>
import API from '@/api.js'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  components: { Multiselect },
  data() {
    return {
      users: [],
      showAddUser: false,
      selectedUser: null,
      currentUser: { id: null, role: '' },
      form: {
        username: '',
        email: '',
        password: '',
        role: 'Bruker',
        permissions: [],
        can_see_all: false
      },
      newPassword: '',
      owners: [],
      newOwner: ''
    }
  },
  async mounted() {
    await this.fetchCurrentUser()
    await this.fetchOwners()
    await this.fetchUsers()
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const response = await API.get('/auth/user')
        this.currentUser.id = response.data.id
        this.currentUser.role = response.data.role
      } catch (error) {
        console.error('Feil ved henting av innlogget bruker:', error)
      }
    },
    async fetchOwners() {
      try {
        const response = await API.get('/inventory')
        const ownerSet = new Set()
        response.data.forEach(item => {
          if (item.owner) ownerSet.add(item.owner)
        })
        this.owners = Array.from(ownerSet).map(owner => ({ name: owner }))
      } catch (error) {
        console.error('Feil ved henting av eiere:', error)
      }
    },
    async fetchUsers() {
      try {
        const response = await API.get('/admin/users')
        this.users = response.data
      } catch (error) {
        console.error('Feil ved henting av brukere:', error)
      }
    },
    addNewOwner() {
      if (this.newOwner.trim() !== '' && !this.owners.find(o => o.name === this.newOwner)) {
        this.owners.push({ name: this.newOwner })
        this.newOwner = ''
      }
    },
    async addUser() {
      try {
        await API.post('/admin/users', {
          username: this.form.username,
          email: this.form.email,
          password: this.form.password,
          role: this.form.role,
          permissions: this.form.permissions.map(p => p.name),
          can_see_all: this.form.can_see_all
        })
        this.fetchUsers()
        this.showAddUser = false
        this.resetForm()
      } catch (error) {
        console.error('Feil ved opprettelse av bruker:', error)
      }
    },
    editUser(user) {
      this.selectedUser = user
      this.form.username = user.username
      this.form.email = user.email
      this.form.role = user.role
      this.form.permissions = user.permissions ? JSON.parse(user.permissions).map(p => ({ name: p })) : []
      this.form.can_see_all = !!user.can_see_all
      this.newPassword = ''
    },
    async updateUser() {
      try {
        await API.put(`/admin/users/${this.selectedUser.id}`, {
          username: this.form.username,
          email: this.form.email,
          role: this.form.role,
          permissions: this.form.permissions.map(p => p.name),
          can_see_all: this.form.can_see_all
        })
        if (this.newPassword.trim() !== '') {
          await API.put(`/admin/users/${this.selectedUser.id}/password`, {
            newPassword: this.newPassword
          })
        }
        this.fetchUsers()
        this.selectedUser = null
        this.resetForm()
      } catch (error) {
        console.error('Feil ved oppdatering av bruker:', error)
      }
    },
    async deleteUser(userId) {
      if (!confirm('Er du sikker på at du vil slette denne brukeren?')) return
      try {
        await API.delete(`/admin/users/${userId}`)
        this.fetchUsers()
      } catch (error) {
        console.error('Feil ved sletting av bruker:', error)
      }
    },
    cancelEdit() {
      this.showAddUser = false
      this.selectedUser = null
      this.resetForm()
    },
    resetForm() {
      this.form = {
        username: '',
        email: '',
        password: '',
        role: 'Bruker',
        permissions: [],
        can_see_all: false
      }
      this.newPassword = ''
    },
    canEdit(user) {
      if (this.currentUser.role === 'Hovedadmin') return true
      if (this.currentUser.role === 'Admin') return user.id === this.currentUser.id || user.role === 'Bruker'
      return false
    },
    canDelete(user) {
      if (this.currentUser.role === 'Hovedadmin') return true
      if (this.currentUser.role === 'Admin') return user.role === 'Bruker'
      return false
    }
  }
}
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
}
</style>
