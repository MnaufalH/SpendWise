import response from '../../../utils/response.js'
import BudgetRepositories from '../repositories/budget-repositories.js'

const getAllBudgeting = (req, res, next) => {
    const { id: user_id } = req.user
    const { bulan, tahun } = req.body

    const budgets = BudgetRepositories.getAllBudgeting(user_id, bulan, tahun)

    return response(res, 200, 'Berhasil', { budgets })
}

const getAllBudgetiWithoutRange = (req, res, next) => {
    const budgets = BudgetRepositories.getAllBudget()

    return response(res, 200, 'Berhasil menampilkan Budget', { budgets })
}

const addBudgeting = (req, res, next) => {
    const { id: user_id } = req.user
    const { name, allocation } = req.body

    if (BudgetRepositories.searchBudgeting(name)) {
        return response(res, 400, 'Category budgeting sudah terdaftar')
    }

    const budget = BudgetRepositories.addBudget(user_id, name, Number(allocation))

    return response(res, 201, 'Berhasil menambahkan budget', { id: budget })
}

const editBudgeting = (req, res, next) => {
    const { budget_id } = req.params
    const { name, allocation } = req.body

    BudgetRepositories.editBudget(budget_id, name, Number(allocation))

    return response(res, 200, 'Berhasil melakukan update budget')
}

const getBudgetById = (req, res, next) => {
    const { budget_id } = req.params

    const budget = BudgetRepositories.getBudgetById(budget_id)
    if (!budget) {
        return response(res, 404, 'Tidak ada budget yang cocok')
    }

    return response(res, 200, 'Berhasil menampilkan budget', budget)
}

const deleteBudgeting = (req, res, next) => {
    const { budget_id } = req.params

    BudgetRepositories.deleteBudget(budget_id)
    return response(res, 200, 'Berhasil menghapus budget')
}

export {
    getAllBudgeting,
    getAllBudgetiWithoutRange,
    addBudgeting,
    editBudgeting,
    getBudgetById,
    deleteBudgeting
}