import React, { useState } from 'react';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    const addCategory = () => {
        if (newCategory) {
            setCategories([...categories, { name: newCategory, id: Date.now() }]);
            setNewCategory('');
        }
    };

    const removeCategory = (id) => {
        setCategories(categories.filter(category => category.id !== id));
    };

    const editCategory = (id, updatedName) => {
        setCategories(categories.map(category => 
            category.id === id ? { ...category, name: updatedName } : category
        ));
    };

    return (
        <div>
            <h2>Manage Categories</h2>
            <input 
                type="text" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
                placeholder="Add new category" 
            />
            <button onClick={addCategory}>Add Category</button>
            <ul>
                {categories.map(category => (
                    <li key={category.id}>
                        <input 
                            type="text" 
                            value={category.name} 
                            onChange={(e) => editCategory(category.id, e.target.value)} 
                        />
                        <button onClick={() => removeCategory(category.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryManager;
