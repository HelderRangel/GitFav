import { GitHubApi } from "./githubfav.js";

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []

        console.log(this.entries)
    };

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
    
          const userExists = this.entries.find(entry => entry.login.toUpperCase() === username.toUpperCase())
    
          if(userExists) {
            throw new Error('Usuário já cadastrado')
          }
    
          const user = await GitHubApi.search(username)
    
          if(user.login === undefined) {
            throw new Error('Usuário não encontrado!')
          }
    
          this.entries = [user, ...this.entries]
          this.update()
          this.save()
          this.Content()
    
        } catch(error) {
          alert(error.message)
        }
      }

    delete(user) {
        const filteredEntries = this.entries
            .filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update() 
        this.save()     
    }
}


export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()

    }

    onadd() {
        const addBtn = this.root.querySelector('.search button')
        addBtn.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    update() {

        if(this.entries.length === 0){
            this.noContent()
        }else{
            this.Content()
        }

        this.removeAlltr()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user span').textContent = user.login;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;
            
            row.querySelector('.remove').addEventListener('click', () => {
                const isOk = confirm(`Are you sure you want to remove ${user.name} from your favorites?`)
                if (isOk) {
                    this.delete(user)
                }
            })

            this.tbody.append(row)
        })
    }

    createRow() {

        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <div class="user-content">
                    <img src="https://github.com/lucasbackend.png" alt=""/>
                    <a href="https://github.com/lucasbackend" target="_blank">
                        <p>Lucas Ribeiro</p>
                        <span>lucasbackend</span>
                    </a>
                </div>
            </td>

            <td class="repositories">10</td>
            
            <td class="followers">10</td>
            
            <td class="action">
                <button class="remove">Remove</button>
            </td>
        `
        return tr
    }
    
    removeAlltr() {
        this.tbody.querySelectorAll('tr')
            .forEach(tr => tr.remove())
    }

    Content(){
        this.root.querySelector('.tb-content').classList.remove('hide')
        this.root.querySelector('.tb-empty').classList.add('hide')
    }

    noContent() {
        this.root.querySelector('.tb-content').classList.add('hide')
        this.root.querySelector('.tb-empty').classList.remove('hide')
    }    

}