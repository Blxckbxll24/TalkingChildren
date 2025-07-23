import { create } from 'zustand';
import { relationService } from '../services/relationService';
import { childMessageService } from '../services/childMessageService';
import { RelationResponse, RelationStats, ChildMessage } from '../types/api';
import Toast from 'react-native-toast-message';

interface RelationState {
    // Estado para tutores
    myChildren: RelationResponse[];
    childrenLoading: boolean;

    // Estado para niños
    myTutors: RelationResponse[];
    tutorsLoading: boolean;

    // Estado para administradores
    allRelations: RelationResponse[];
    relationStats: RelationStats | null;
    relationsLoading: boolean;

    // Estado para mensajes de niños
    childMessages: ChildMessage[];
    favoriteMessages: ChildMessage[];
    messagesLoading: boolean;

    // Estado general
    error: string | null;

    // Acciones para tutores
    loadMyChildren: () => Promise<void>;
    linkChild: (childId: number) => Promise<boolean>;
    unlinkChild: (childId: number) => Promise<boolean>;
    assignMessageToChild: (childId: number, messageId: number) => Promise<boolean>;
    removeMessageFromChild: (childId: number, messageId: number) => Promise<boolean>;
    loadChildMessages: (childId: number) => Promise<void>;

    // Acciones para niños
    loadMyTutors: () => Promise<void>;
    loadMyMessages: () => Promise<void>;
    loadFavoriteMessages: () => Promise<void>;
    toggleMessageFavorite: (assignmentId: number, currentState: boolean) => Promise<boolean>;

    // Acciones para administradores
    loadAllRelations: () => Promise<void>;
    loadRelationStats: () => Promise<void>;
    deleteRelation: (relationId: number) => Promise<boolean>;

    // Acciones generales
    clearError: () => void;
    clearAll: () => void;
}

export const useRelationStore = create<RelationState>((set, get) => ({
    // Estado inicial
    myChildren: [],
    childrenLoading: false,
    myTutors: [],
    tutorsLoading: false,
    allRelations: [],
    relationStats: null,
    relationsLoading: false,
    childMessages: [],
    favoriteMessages: [],
    messagesLoading: false,
    error: null,

    // Acciones para tutores
    loadMyChildren: async () => {
        try {
            set({ childrenLoading: true, error: null });
            const children = await relationService.getMyChildren();
            set({ myChildren: children, childrenLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando niños';
            set({ error: errorMessage, childrenLoading: false });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    linkChild: async (childId: number): Promise<boolean> => {
        try {
            set({ error: null });
            const newRelation = await relationService.linkChild(childId);

            set(state => ({
                myChildren: [...state.myChildren, newRelation]
            }));

            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Niño vinculado correctamente',
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.message || 'Error vinculando niño';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            return false;
        }
    },

    unlinkChild: async (childId: number): Promise<boolean> => {
        try {
            set({ error: null });
            await relationService.unlinkChild(childId);

            set(state => ({
                myChildren: state.myChildren.filter(relation => relation.child.id !== childId)
            }));

            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Niño desvinculado correctamente',
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.message || 'Error desvinculando niño';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            return false;
        }
    },

    assignMessageToChild: async (childId: number, messageId: number): Promise<boolean> => {
        try {
            set({ error: null });
            await childMessageService.assignMessage({ child_id: childId, message_id: messageId });

            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Mensaje asignado correctamente',
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.message || 'Error asignando mensaje';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            return false;
        }
    },

    removeMessageFromChild: async (childId: number, messageId: number): Promise<boolean> => {
        try {
            set({ error: null });
            await childMessageService.removeMessageAssignment(childId, messageId);

            // Actualizar la lista local si estamos viendo mensajes de ese niño
            set(state => ({
                childMessages: state.childMessages.filter(cm =>
                    !(cm.child_id === childId && cm.message_id === messageId)
                )
            }));

            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Mensaje removido correctamente',
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.message || 'Error removiendo mensaje';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            return false;
        }
    },

    loadChildMessages: async (childId: number) => {
        try {
            set({ messagesLoading: true, error: null });
            const messages = await childMessageService.getChildMessages(childId);
            set({ childMessages: messages, messagesLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando mensajes del niño';
            set({ error: errorMessage, messagesLoading: false });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    // Acciones para niños
    loadMyTutors: async () => {
        try {
            set({ tutorsLoading: true, error: null });
            const tutors = await relationService.getMyTutors();
            set({ myTutors: tutors, tutorsLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando tutores';
            set({ error: errorMessage, tutorsLoading: false });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    loadMyMessages: async () => {
        try {
            set({ messagesLoading: true, error: null });
            const messages = await childMessageService.getMyMessages();
            set({ childMessages: messages, messagesLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando mis mensajes';
            set({ error: errorMessage, messagesLoading: false });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    loadFavoriteMessages: async () => {
        try {
            set({ messagesLoading: true, error: null });
            const messages = await childMessageService.getFavoriteMessages();
            set({ favoriteMessages: messages, messagesLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando mensajes favoritos';
            set({ error: errorMessage, messagesLoading: false });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    toggleMessageFavorite: async (assignmentId: number, currentState: boolean): Promise<boolean> => {
        try {
            set({ error: null });
            const updatedAssignment = await childMessageService.toggleFavorite(assignmentId, currentState);

            // Actualizar en ambas listas
            set(state => ({
                childMessages: state.childMessages.map(cm =>
                    cm.id === assignmentId ? updatedAssignment : cm
                ),
                favoriteMessages: currentState
                    ? state.favoriteMessages.filter(cm => cm.id !== assignmentId)
                    : [...state.favoriteMessages, updatedAssignment]
            }));

            Toast.show({
                type: 'success',
                text1: currentState ? 'Removido de favoritos' : 'Añadido a favoritos',
                text2: 'Cambio realizado correctamente',
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.message || 'Error actualizando favorito';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            return false;
        }
    },

    // Acciones para administradores
    loadAllRelations: async () => {
        try {
            set({ relationsLoading: true, error: null });
            const relations = await relationService.getAllRelations();
            set({ allRelations: relations, relationsLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando relaciones';
            set({ error: errorMessage, relationsLoading: false });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    loadRelationStats: async () => {
        try {
            set({ error: null });
            const stats = await relationService.getRelationStats();
            set({ relationStats: stats });
        } catch (error: any) {
            const errorMessage = error.message || 'Error cargando estadísticas';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    },

    deleteRelation: async (relationId: number): Promise<boolean> => {
        try {
            set({ error: null });
            await relationService.deleteRelationById(relationId);

            set(state => ({
                allRelations: state.allRelations.filter(relation => relation.id !== relationId)
            }));

            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: 'Relación eliminada correctamente',
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.message || 'Error eliminando relación';
            set({ error: errorMessage });
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            return false;
        }
    },

    // Acciones generales
    clearError: () => {
        set({ error: null });
    },

    clearAll: () => {
        set({
            myChildren: [],
            myTutors: [],
            allRelations: [],
            relationStats: null,
            childMessages: [],
            favoriteMessages: [],
            error: null,
            childrenLoading: false,
            tutorsLoading: false,
            relationsLoading: false,
            messagesLoading: false,
        });
    },
}));

// Hooks específicos para facilitar el uso
export const useMyChildren = () => {
    const { myChildren, childrenLoading, loadMyChildren } = useRelationStore();
    return { myChildren, childrenLoading, loadMyChildren };
};

export const useMyTutors = () => {
    const { myTutors, tutorsLoading, loadMyTutors } = useRelationStore();
    return { myTutors, tutorsLoading, loadMyTutors };
};

export const useChildMessages = () => {
    const { childMessages, favoriteMessages, messagesLoading, loadMyMessages, loadFavoriteMessages } = useRelationStore();
    return { childMessages, favoriteMessages, messagesLoading, loadMyMessages, loadFavoriteMessages };
};
