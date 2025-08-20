import { NotFoundException } from '@nestjs/common';
import { DeleteTripService } from './delete-trip.service';

describe('DeleteTripService', () => {
  let service: DeleteTripService;
  let repo: { deleteById: jest.Mock };

  beforeEach(() => {
    repo = { deleteById: jest.fn() };
    service = new DeleteTripService(repo as any);
  });

  it('should delete a trip when found', async () => {
    repo.deleteById.mockResolvedValue(true);
    await expect(service.execute('trip-id')).resolves.toBeUndefined();
    expect(repo.deleteById).toHaveBeenCalledWith('trip-id');
  });

  it('should throw NotFoundException when trip not found', async () => {
    repo.deleteById.mockResolvedValue(false);
    await expect(service.execute('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.deleteById).toHaveBeenCalledWith('missing-id');
  });
});
