import fs from 'fs/promises';
import { nanoid } from "nanoid";

const pathData = './userData.json'
let dataBase = []

const readData = async () => {
    try {
        if (dataBase.length === 0) {
            const data = await fs.readFile(pathData, 'utf-8')

            if (!data.trim()) {
                dataBase = []
            }
            else dataBase = JSON.parse(data)
        }
        return dataBase
    } catch (error) {
        console.error('Gagal membaca file', error)
    }
}

const writeData = async () => {
    try {
        const dataParsed = JSON.stringify(dataBase, null, 4)
        await fs.writeFile(pathData, dataParsed, 'utf-8')
    } catch (error) {
        console.error('Gagal menulis file', error)
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    const { users } = await readData()
    const findedUser = users.find((user) => {
        return user.email === email && user.password === password
    })

    if (!findedUser) {
        return res.status(401).json({
            message: 'Email dan Password salah'
        })
    }

    return res.status(200).json({
        message: 'Login berhasil',
        data: findedUser.userId
    })
}

const saveNewUser = (data) => {
    const newBudget = {
        userId: data.userId
    }

    const newWallets = {
        userId: data.userId,
        bca: 0,
        cash: 0,
        ovo: 0,
        dana: 0
    }

    dataBase.users.push(data)
    dataBase.budgets.push(newBudget)
    dataBase.wallets.push(newWallets)
    writeData()
}

const regist = async (req, res) => {
    const { fullName, username, email, password } = req.body

    const { users } = await readData()
    const alreadyExist = users.some(user => user.email === email)

    if (alreadyExist) {
        return res.status(409).json({
            message: 'Gagal melakukan register karena email digunakan'
        })
    }

    const userId = `usr-${nanoid(7)}`

    const newDataUser = {
        userId,
        fullName,
        username,
        email,
        password
    }

    saveNewUser(newDataUser)

    return res.status(201).json({
        message: 'Berhasil registrasi',
        data: userId
    })
}

const getUserBudget = async (req, res) => {
    const { id } = req.params

    const { budgets } = await readData()
    const userBudget = budgets.filter(budget => budget.userId === id)

    if (userBudget.length == 0) {
        return res.status(200).json({
            message: 'Berhasil, namun belum memiliki budgeting',
            data: []
        })
    }

    return res.status(200).json({
        message: 'Berhasil, sudah memiliki budgeting',
        data: userBudget
    })
}

const addUserBudget = async (req, res) => {
    const { id } = req.params
    const userInput = req.body

    const { budgets } = await readData()

    const alreadyExist = budgets.some(budget => budget.userId === id && budget.name === userInput.name)

    if (alreadyExist) {
        return res.status(409).json({
            message: 'Budget sudah pernah ditambahkan'
        })
    }

    const newBudget = {
        ...userInput,
        userId: id
    }

    dataBase.budgets.push(newBudget)
    writeData()

    return res.json({
        message: 'Berhasil menambahkan budget'
    })
}

const editUserBudget = async (req, res) => {
    const { userId, trcId } = req.params
    
    const { budgets } = await readData()
    
    const founded = budgets.find(budget => budget.userId === userId && budget.id === trcId)

    if (!founded) {
        return res.status(404).json({
            message: 'Budget tidak ditemukan'
        })
    }


}

const getUserData = (_, res) => {
    return res.json()
}

// const baca = () => {
//     fs.readFile(pathData, 'utf-8', (err, data) => {
//         if (err) {
//             console.log('Gagal membaca file', err)
//             return
//         }

//         try {
//             const dataParsed = JSON.parse(data)
//             userData = dataParsed.users[0]
//             console.log(userData)
//         } catch (error) {
//             console.log('Error saat parsing dataUser', error)
//         }
//     })
// }

// const tulis = () => {
//     tambah()
//     const updatedData = JSON.stringify(userData, null, 2)
//     fs.writeFile(pathData, updatedData, 'utf-8', (err) => {
//         if (err) {
//             return new Error('Gagal ditulis ke file')
//         }
//         console.log('Berhasil ditulis ke file')
//         console.log(userData);
//     })
// }

// const tambah = () => {
//     const newData = {
//         id: "usr-2",
//         fullName: "Ervan Setyatama",
//         username: "Tama",
//         email: "tama@gg.com",
//         password: "tama1234",
//         budgets: [],
//         wallets: [
//             { id: "wlt-1", name: "BCA", amount: 0 },
//             { id: "wlt-2", name: 'Cash', amount: 0 },
//             { id: "wlt-3", name: "OVO", amount: 0 },
//             { id: "wlt-4", name: "Dana", amount: 0 }
//         ],
//         transactions: []
//     }

//     userData.users.push(newData)
// }

export { getUserData, login, regist, getUserBudget, addUserBudget, editUserBudget }