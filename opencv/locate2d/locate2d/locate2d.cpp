//locate2d.cpp

//-----------------------------------------------
//���������ͨ����Ԥ�������ͼ����ǵ����õ���
//��Ե�������㼯�ϣ�Ȼ��ȷ������ͼ�������㼯�Ķ�
//Ӧ��ϵ�����������λ�α仯
//-----------------------------------------------

#include "locate2d.h"

int main(int argc, char** argv)
{

	//2.0��Ҫ���µ����ݣ�����GUI

	//�����ı�
	helptext();

	//����ͼ��
	loadimg();

	//ͼ��Ԥ����
	preproc();

	//�������ں͹�����  
	namedWindow("win_1", CV_WINDOW_AUTOSIZE);
	namedWindow("win_2", CV_WINDOW_AUTOSIZE);
	createTrackbar("�ǵ�����ֵ: ", "win_1", &thresh, max_thresh, on_detect);
	createTrackbar("��ֵͼ��ֵ��  ", "win_1", &thresh_bi, max_thresh_bi, on_detect);

	//����һ�λص����������г�ʼ��  
	on_detect(0, 0);

	//��ѯ��ȡ��ֵ�Ծ�������
	getkey();

	return 0;

}

//ͼ�����뺯��-----------------------------------
int loadimg() {

	//1.0������ͼ�񲿷� 
	/*char src_name[64];
	printf("Image source: \n");
	scanf_s("%s", &src_name, 63);
	src = imread(src_name);*/
	src = imread("1.jpg");
	if (src.empty()) {
		printf("Error loading image. \n");
		return -1;
	}

	//��ʾԭͼ
	//imshow("src", src);
}
//-----------------------------------------------

//�ص�����---------------------------------------
void on_detect(int, void*)
{

	Mat dst;//Ŀ��ͼ  
	Mat norm;//��һ�����ͼ  
	Mat scaled;//���Ա任��İ�λ�޷������͵�ͼ  

			   //��ʼ��
	dst = Mat::zeros(src.size(), CV_32FC1);
	temp = src.clone();

	//��Ϊ��ֵͼ
	Laplacian(gray, border, CV_16S, 3, 1, 0, BORDER_DEFAULT);
	convertScaleAbs(border, abs_border);
	threshold(abs_border, binary, thresh_bi, max_thresh_bi, 0);

	//���нǵ���
	cornerHarris(binary, dst, 2, 3, 0.04, BORDER_DEFAULT);

	//��һ����ת��  
	normalize(dst, norm, 0, 255, NORM_MINMAX, CV_32FC1, Mat());
	convertScaleAbs(norm, scaled);//����һ�����ͼ���Ա任��8λ�޷�������   

								  // ����⵽�ģ��ҷ�����ֵ�����Ľǵ���Ƴ���  
	for (int x = 0; x < norm.rows; x++)
	{
		for (int y = 0; y < norm.cols; y++)
		{
			if ((int)norm.at<float>(x, y) > thresh + 80)
			{
				circle(binary, Point(y, x), 5, Scalar(255, 255, 255), 2, 8, 0);
				circle(temp, Point(y, x), 5, Scalar(0, 0, 0), 2, 8, 0);
			}
		}
	}

	//Ч����ʾ 
	imshow("win_1", binary);
	imshow("win_2", temp);

}
//-----------------------------------------------

//ͼ��Ԥ������---------------------------------
void preproc() {

	temp = src.clone();

	GaussianBlur(src, src, Size(3, 3), 0, 0, BORDER_DEFAULT);
	cvtColor(src, gray, CV_RGB2GRAY);
	Mat element = getStructuringElement(MORPH_RECT, Size(offset * 2 + 1, offset * 2 + 1), Point(offset, offset));
	morphologyEx(gray, gray, CV_MOP_OPEN, element);

	//�����ֵͼ���ҳ��߽磬�����ջ�Ϊ��ֵͼ
	Laplacian(gray, border, CV_16S, 3, 1, 0, BORDER_DEFAULT);
	convertScaleAbs(border, abs_border);
	threshold(abs_border, binary, thresh_bi, max_thresh_bi, 0);
}
//-----------------------------------------------

//��ѯ��ȡ��ֵ����-------------------------------
int getkey() {

	while (1) {
		key = waitKey(9);
		switch (key) {
		case 27://esc
			return 0;
			break;

		case 'q':
			return 0;
			break;

		case 13://enter
			locate2d();
			break;

		case 32://space
			locate2d();
			break;

		case  'r'://���¶�ȡͼ��
			restart();
			break;
		}
	}
}
//-----------------------------------------------

//��������ͼ����-------------------------------
void restart() {
	
	loadimg();

	preproc();

}
//-----------------------------------------------

//��ʾ�ı���ʾ����-------------------------------
void helptext() {

	printf("���ƽ�涨λ��ʾ���� \t ver.1.0 \n"
		   "˵��������2���ߴ���ͬ��ͼ����ʶ��ͼ���������ƽ���ƶ��� \n"
		   "���ڻ����������Ч���Ϻõ�������Ⱥ��Ȼ�����ʶ����� \n"
		   "ʶ�� �س� / �ո� \n ��������ͼ�� r \n �˳��� Esc / Q \n"
	
		   "\t\t\t\t\t created by hgj \n");

}
//-----------------------------------------------

//�����λ����-----------------------------------
void locate2d() {



}
//-----------------------------------------------