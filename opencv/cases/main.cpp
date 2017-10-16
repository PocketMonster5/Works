//main.cpp

#include <iostream>
#include <stdio.h>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/highgui/highgui.hpp>

using namespace std;
using namespace cv;

#define WIN_1 "ԭʼͼ�񴰿�"
#define WIN_2 "ͼ����ڴ���_1"
#define WIN_3 "ͼ����ڴ���_2"

int bright_1 = 50; //Ĭ�ϳ�ʼ���ȣ�����1
int bright_2 = 50; //Ĭ�ϳ�ʼ���ȣ�����2
Mat img, img_1, img_2; //���ڴ洢ͼ��

static void callback_1(int, void *); //�������ȵĻص�����������1
static void callback_2(int, void *); //�������ȵĻص�����������2
void helptext(); //�����ı�

int main() {

	namedWindow(WIN_1, 1); //����ԭʼͼ�񴰿�
	namedWindow(WIN_2, 1); //����ͼƬ���񴰿�_1
	namedWindow(WIN_3, 1); //����ͼƬ���񴰿�_2
	createTrackbar("����", WIN_2, &bright_1, 100, callback_1); //�������ڵ������ȵĻ�����
	createTrackbar("����", WIN_3, &bright_2, 100, callback_2); //�������ڵ������ȵĻ�����

	img = imread("lena.jpg");
	if (!img.data) {
		printf("Error loading image. \n");
		return -1;
	}
	imshow(WIN_1, img);
	//��ȡ����ʾԭʼͼ��lena.jpg

	img_1 = Mat::zeros(img.rows, img.cols, img.type());
	img_2 = Mat::zeros(img.rows, img.cols, img.type());
	//ͬ������ͼƬ�Ͳο������Ĵ�С&���ͣ�ȡ����Ϊ��ɫ

	callback_1(bright_1, 0); //����һ�λص���������ʱͼ����ڴ������Ȳ���
	callback_2(bright_2, 0); //����һ�λص���������ʱͼ����ڴ������Ȳ���

	helptext(); //�����ı���ʾ

	return 0;

}

void helptext() {

	printf("ʹ�õ�opencv�汾��");
	printf(CV_VERSION);
	printf("\n˵���� \n\t���ڻ������Ըı�����. \n\tͼ����ڴ���_1������ֱ������rgbֵ�ķ���. \n\tͼ����ڴ���_2�����úͰ�ɫ�������Բ�ֵ���Ƶķ���. \n");
	printf("Press Q to exit. \n");
	while (char(waitKey(1) != 'q')) {

	}

}

static void callback_1(int, void *) {

	int bright_r_1;
	bright_r_1 = bright_1 * 255 / 100; //ת���ɾ���������õ����ֵ
	
	for (int x = 0;x < img.rows;x++) {
		for (int y = 0;y < img.cols;y++) {
			for (int rgb = 0;rgb < 3;rgb++) {
				img_1.at<Vec3b>(x, y)[rgb] = saturate_cast<uchar>(img.at<Vec3b>(x, y)[rgb] + bright_r_1 - 128);
			}
		}
	}
	//�������ֱ������ÿ�����ص�rgbֵ

	imshow(WIN_2, img_1); //��ʾ���ں�ͼ��

}

static void callback_2(int, void *) {

	double bright_r_2;
	bright_r_2 = double(bright_2) / 100; //ת���ɾ���������õ����ֵ

	for (int x = 0;x < img.rows;x++) {
		for (int y = 0;y < img.cols;y++) {
			for (int rgb = 0;rgb < 3;rgb++) {
				img_2.at<Vec3b>(x, y)[rgb]
					= saturate_cast<uchar>(img.at<Vec3b>(x, y)[rgb] * (1.5 - bright_r_2) + 255 * (- 0.5 + bright_r_2));
			}
		}
	}
	//�������ͨ���ʹ���ɫ���������Բ�ֵ���Ƶķ�����������

	imshow(WIN_3, img_2); //��ʾ���ں�ͼ��

}