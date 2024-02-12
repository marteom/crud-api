import server from '../server';
import request from 'supertest';

const API_URL = '/api/users';

const mockUser = {
    username: 'Piter Parker',
    age: 39,
    hobbies: ['soccer', 'chess'],
}

describe('Endpoint data', () => {
    it('Get all users', async () => {
        const res = await request(server).get(API_URL);
        expect(res.status).toBe(200);
        expect(JSON.parse(res.text)).toEqual([]);
    });

    it('Get user by id', async () => {
        const res = await request(server).post(API_URL).send(mockUser);
        const targetId = JSON.parse(res.text).id;

        const responseWithTargetUser = await request(server).get(
            `${API_URL}/${targetId}`
        );

        expect(responseWithTargetUser.status).toBe(200);
        expect(JSON.parse(responseWithTargetUser.text)).toEqual({
            id: targetId,
            ...mockUser,
        });
    });

    it('Create user', async () => {
        const response = await request(server).post(API_URL).send(mockUser);

        expect(response.status).toBe(201);
        expect(JSON.parse(response.text)).toEqual({
            id: JSON.parse(response.text).id,
            ...mockUser,
        });
    });

    it('Update user', async () => {
        const res = await request(server).post(API_URL).send(mockUser);
        const postedUser = JSON.parse(res.text);
        const newUserData = {
            username: 'Tom Hanks',
            age: 50,
            hobbies: ['programming'],
        };

        const responseWithUpdatedUser = await request(server)
            .put(`${API_URL}/${postedUser.id}`)
            .send(newUserData);

        expect(responseWithUpdatedUser.status).toBe(200);
        expect(JSON.parse(responseWithUpdatedUser.text)).toEqual({
            id: postedUser.id,
            ...newUserData,
        });
    })

    it('Delete user', async () => {
        const res = await request(server).post(API_URL).send(mockUser);

        const postedUserId = JSON.parse(res.text).id;

        const responseByUserDeleting = await request(server).delete(
            `${API_URL}/${postedUserId}`
        );

        expect(responseByUserDeleting.status).toBe(204);
    })
})

afterAll(() => {
   server.close();
})