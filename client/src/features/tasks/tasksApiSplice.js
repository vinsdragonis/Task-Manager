import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const tasksAdapter = createEntityAdapter({
    sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
});
const initialState = tasksAdapter.getInitialState();

export const tasksApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNotes: builder.query({
            query: () => '/tasks',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            keepUnusedDataFor: 5,
            transformResponse: responseData => {
                const loadedNotes = responseData.map(task => {
                    task.id = task._id
                    return task
                });
                return tasksAdapter.setAll(initialState, loadedNotes)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Note', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Note', id }))
                    ]
                } else return [{ type: 'Note', id: 'LIST' }]
            }
        }),
    }),
});

export const {
    useGetNotesQuery,
} = tasksApiSlice;

// returns the query result object
export const selectNotesResult = tasksApiSlice.endpoints.getNotes.select();

// creates memoized selector
const selectNotesData = createSelector(
    selectNotesResult,
    tasksResult => tasksResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds
    // Pass in a selector that returns the tasks slice of state
} = tasksAdapter.getSelectors(state => selectNotesData(state) ?? initialState);