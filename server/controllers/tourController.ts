import { Request, Response } from 'express';
import { query } from '../database/db';

export const getAllTours = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM tours ORDER BY created_at DESC');

    const tours = result.rows.map((tour: any) => {
      let routePoints = null;
      if (tour.route_points) {
        try {
          // Парсим JSON строку в массив
          routePoints = JSON.parse(tour.route_points);
          console.log(
            `Tour ${tour.id} route_points parsed successfully:`,
            routePoints,
          );
        } catch (e) {
          console.error(`Error parsing route_points for tour ${tour.id}:`, e);
          routePoints = null;
        }
      }
      return {
        ...tour,
        route_points: routePoints,
      };
    });

    res.json(tours);
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM tours WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const tour = result.rows[0];
    let routePoints = null;
    if (tour.route_points) {
      try {
        if (typeof tour.route_points === 'string') {
          routePoints = JSON.parse(tour.route_points);
        } else {
          routePoints = tour.route_points;
        }
      } catch (e) {
        console.error('Error parsing route_points:', e);
      }
    }

    res.json({
      ...tour,
      route_points: routePoints,
    });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      duration,
      price,
      image_url,
      max_participants,
      included,
      not_included,
      schedule,
      route_points,
      is_active,
    } = req.body;

    // Преобразуем route_points в строку
    let routePointsStr = null;
    if (route_points) {
      routePointsStr =
        typeof route_points === 'string'
          ? route_points
          : JSON.stringify(route_points);
    }

    const result = await query(
      `INSERT INTO tours (
        title, description, duration, price, image_url, 
        max_participants, included, not_included, schedule, route_points, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        title,
        description,
        duration,
        price,
        image_url,
        max_participants || 10,
        included,
        not_included,
        schedule,
        routePointsStr,
        is_active !== undefined ? is_active : true,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      duration,
      price,
      image_url,
      max_participants,
      included,
      not_included,
      schedule,
      route_points,
      is_active,
    } = req.body;

    console.log('Updating tour ID:', id);

    // Преобразуем route_points в строку
    let routePointsStr = null;
    if (route_points) {
      routePointsStr =
        typeof route_points === 'string'
          ? route_points
          : JSON.stringify(route_points);
      console.log('route_points to save:', routePointsStr);
    }

    const result = await query(
      `UPDATE tours 
       SET title = $1, description = $2, duration = $3, price = $4, 
           image_url = $5, max_participants = $6, included = $7, 
           not_included = $8, schedule = $9, route_points = $10, is_active = $11
       WHERE id = $12 RETURNING *`,
      [
        title,
        description,
        duration,
        price,
        image_url,
        max_participants || 10,
        included,
        not_included,
        schedule,
        routePointsStr,
        is_active !== undefined ? is_active : true,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    console.log(
      'Tour updated, route_points in DB:',
      result.rows[0].route_points,
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM tours WHERE id = $1 RETURNING *', [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
